require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'chefai-michelin-star-secret-key';

// Initialize Google OAuth2 Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection Configuration
// Uses connection caching for Vercel serverless (reuse across warm invocations)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chefai';
let db;
let mongoClient;

// Cached connection for serverless environments
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 20000,
  });

  await client.connect();
  const database = client.db();

  cachedClient = client;
  cachedDb = database;
  db = database;

  console.log('Connected to MongoDB database successfully.');

  // Create unique indices for schemas
  await database.collection('users').createIndex({ username: 1 }, { unique: true });
  await database.collection('favorites').createIndex({ userId: 1, recipeId: 1 }, { unique: true });

  return { client, db: database };
}

// Connect on startup (non-blocking, best-effort)
connectToDatabase()
  .then(() => seedAdminAccount())
  .catch((err) => {
    console.error('MongoDB startup connection error:', err.message);
  });

async function seedAdminAccount() {
  const usersCollection = db.collection('users');
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  try {
    const existingAdmin = await usersCollection.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await usersCollection.insertOne({
        username: adminUsername,
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`Admin account seeded successfully. Username: ${adminUsername}`);
    } else {
      console.log(`Admin account exists. Username: ${existingAdmin.username}`);
    }
  } catch (error) {
    console.error('Error seeding admin account:', error.message);
  }
}

// Database check helper middleware
const checkDbConnection = async (req, res, next) => {
  if (!db) {
    try {
      await connectToDatabase();
    } catch (err) {
      console.error('DB reconnect failed:', err.message);
      return res.status(503).json({ error: 'Database connection is currently unavailable. Please verify MONGODB_URI is configured correctly.' });
    }
  }
  next();
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Admin Authorization Middleware
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin authorization required.' });
  }
};

// Config Endpoint (Expose Google Client ID safely to the client)
app.get('/api/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || ''
  });
});

// ==========================================
// AUTHENTICATION API ROUTES (MongoDB Atlas)
// ==========================================

// Google Sign-In Endpoint
app.post('/api/auth/google', checkDbConnection, async (req, res) => {
  const { credential, isMock } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Google Credential Token is required' });
  }

  try {
    let email, name, googleId;

    // Use mock mode if explicitly requested OR if GOOGLE_CLIENT_ID is not configured
    const clientPlaceholder = 'your_google_client_id_here';
    const isClientConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== clientPlaceholder;

    if (isMock || !isClientConfigured) {
      // Decode mock credential JSON payload
      try {
        const mockData = JSON.parse(credential);
        email = mockData.email || 'mockuser@gmail.com';
        name = mockData.name || 'Mock Google User';
        googleId = mockData.googleId || 'mock-google-id-12345';
      } catch (e) {
        email = 'mockuser@gmail.com';
        name = 'Mock Google User';
        googleId = 'mock-google-id-12345';
      }
    } else {
      // Real Verify ID Token with Google Client
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      email = payload['email'];
      name = payload['name'] || email.split('@')[0];
      googleId = payload['sub'];
    }

    const usersCollection = db.collection('users');
    
    // Find or create user
    let user = await usersCollection.findOne({ $or: [{ googleId }, { email }] });
    
    if (!user) {
      // Create new user linked to Google Account
      const result = await usersCollection.insertOne({
        googleId,
        email,
        username: name.trim(),
        role: 'user'
      });
      user = {
        _id: result.insertedId,
        username: name.trim(),
        role: 'user'
      };
    } else if (!user.googleId) {
      // Link Google Account to existing local user with matching email
      await usersCollection.updateOne({ _id: user._id }, { $set: { googleId, email } });
    }

    const userId = user._id.toString();
    const token = jwt.sign(
      { id: userId, username: user.username, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google Login successful',
      token,
      user: { id: userId, username: user.username, role: user.role || 'user' }
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(401).json({ error: `Google authentication failed: ${error.message}` });
  }
});

// Local User Signup
app.post('/api/auth/signup', checkDbConnection, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const usersCollection = db.collection('users');
    
    const existingUser = await usersCollection.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await usersCollection.insertOne({
      username: username.trim(),
      password: hashedPassword,
      role: 'user'
    });

    const userId = result.insertedId.toString();
    const token = jwt.sign({ id: userId, username, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, username, role: 'user' }
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Local User Login
app.post('/api/auth/login', checkDbConnection, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ username: username.trim() });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const userId = user._id.toString();
    const token = jwt.sign(
      { id: userId, username: user.username, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: userId, username: user.username, role: user.role || 'user' }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get User Profile (Verify session)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ==========================================
// ADMIN DASHBOARD API ROUTES
// ==========================================

// Get App Statistics
app.get('/api/admin/stats', checkDbConnection, authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const usersCount = await db.collection('users').countDocuments();
    const favoritesCount = await db.collection('favorites').countDocuments();
    
    res.json({
      stats: {
        totalUsers: usersCount,
        totalFavorites: favoritesCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

// Get list of all users
app.get('/api/admin/users', checkDbConnection, authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    
    // Format payload for tables
    const formattedUsers = users.map(u => ({
      id: u._id.toString(),
      username: u.username,
      email: u.email || 'N/A',
      role: u.role || 'user',
      googleAccount: !!u.googleId
    }));
    
    res.json({ users: formattedUsers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Delete a user and their favorites
app.delete('/api/admin/users/:userId', checkDbConnection, authenticateToken, verifyAdmin, async (req, res) => {
  const userId = req.params.userId;

  try {
    // Delete user
    const usersResult = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
    
    if (usersResult.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's favorites
    await db.collection('favorites').deleteMany({ userId: userId });

    res.json({ message: 'User and associated favorites deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ==========================================
// FAVORITES API ROUTES (MongoDB Atlas)
// ==========================================

// Get all favorites for user
app.get('/api/favorites', checkDbConnection, authenticateToken, async (req, res) => {
  try {
    const favoritesCollection = db.collection('favorites');
    const rows = await favoritesCollection.find({ userId: req.user.id }).toArray();
    const favorites = rows.map(row => JSON.parse(row.recipeData));
    res.json({ favorites });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve favorites' });
  }
});

// Add a favorite
app.post('/api/favorites', checkDbConnection, authenticateToken, async (req, res) => {
  const { recipe } = req.body;

  if (!recipe || !recipe.id || !recipe.name) {
    return res.status(400).json({ error: 'Valid recipe object required' });
  }

  try {
    const favoritesCollection = db.collection('favorites');
    await favoritesCollection.updateOne(
      { userId: req.user.id, recipeId: recipe.id },
      { 
        $set: { 
          recipeName: recipe.name,
          recipeData: JSON.stringify(recipe) 
        } 
      },
      { upsert: true }
    );

    res.status(201).json({ message: 'Added to database favorites' });
  } catch (error) {
    console.error('Add favorite error:', error.message);
    res.status(500).json({ error: 'Failed to save favorite' });
  }
});

// Remove a favorite
app.delete('/api/favorites/:recipeId', checkDbConnection, authenticateToken, async (req, res) => {
  const recipeId = req.params.recipeId;

  try {
    const favoritesCollection = db.collection('favorites');
    const result = await favoritesCollection.deleteOne({ userId: req.user.id, recipeId: recipeId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Removed from database favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
});

// ==========================================
// GENERATIVE AI GENERATION ROUTE
// ==========================================
app.post('/api/generate', async (req, res) => {
  const {
    ingredients,
    cuisine,
    diet,
    mealType,
    cookingTime,
    difficulty,
    servings,
    allergies,
    extra
  } = req.body;

  // Retrieve Gemini API Key with fallback checks
  let apiKey = req.headers['x-gemini-api-key'];
  if (!apiKey || apiKey === 'null' || apiKey === 'undefined' || apiKey.trim() === '') {
    apiKey = process.env.GEMINI_API_KEY;
  }

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return res.status(400).json({
      error: 'Gemini API Key is missing or invalid. Please open your project\'s ".env" file and paste your key under GEMINI_API_KEY, or click the App Settings (⚙️ gear icon) in the navigation bar to enter it directly.'
    });
  }

  const prompt = `Act as Vanta AI, a world-class Michelin Star Chef, Certified Nutritionist, Food Scientist, and AI Culinary Assistant.

Your objective is to generate a personalized, healthy, delicious, and practical recipe based on the user's available ingredients and preferences.

=========================
USER INPUT
=========================
Available Ingredients:
${ingredients ? ingredients.join(', ') : 'None specified'}

Cuisine:
${cuisine || 'Any'}

Diet Preference:
${diet || 'No Preference'}

Meal Type:
${mealType || 'Dinner'}

Cooking Time Limit:
${cookingTime || '45'} minutes

Difficulty Level:
${difficulty || 'Medium'}

Servings:
${servings || '2'}

Allergies:
${allergies ? allergies.join(', ') : 'None'}

Additional Instructions:
${extra || 'None'}

=========================
YOUR TASK
=========================
Generate ONE original recipe that:
• Uses the available ingredients as much as possible.
• Suggests the minimum number of additional ingredients.
• Avoids all allergy ingredients.
• Matches the selected cuisine.
• Matches the dietary preference.
• Fits within the specified cooking time.
• Is beginner friendly if difficulty is Easy.
• Has clear cooking instructions.
• Uses metric units.
• Includes estimated nutrition values.

=========================
OUTPUT FORMAT
=========================
Return the recipe strictly as a JSON object matching this schema. Do not wrap in markdown code blocks. Return clean JSON string.

Schema:
{
  "id": "unique_string_id_no_spaces",
  "name": "Creative Recipe Name",
  "altNames": ["Alternative Name 1", "Alternative Name 2", "Alternative Name 3"],
  "description": "Short, engaging, Michelin-level description.",
  "cuisine": "${cuisine || 'Any'}",
  "diet": "${diet || 'No Preference'}",
  "mealType": "${mealType || 'Dinner'}",
  "difficulty": "${difficulty || 'Medium'}",
  "prepTime": 15,
  "cookTime": 30,
  "baseServings": ${servings || '2'},
  "nutrition": {
    "calories": 450,
    "protein": 25,
    "carbs": 60,
    "fat": 15,
    "fiber": 6
  },
  "requiredIngredients": [
    "ingredient 1 with quantity (e.g. '200g Chicken breast')",
    ...
  ],
  "optionalIngredients": [
    "optional ingredient with quantity (e.g. '1 tbsp Olive oil')",
    ...
  ],
  "additionalNeeded": [
    "suggested additional ingredient with quantity (e.g. '1 pinch Salt')",
    ...
  ],
  "equipment": [
    "kitchen tool 1",
    ...
  ],
  "instructions": [
    "Step 1 description...",
    "Step 2 description...",
    ...
  ],
  "tips": [
    "Chef tip 1",
    "Chef tip 2"
  ],
  "mistakes": [
    "Common mistake to avoid 1",
    "Common mistake to avoid 2"
  ],
  "plating": "Elegant presentation and plating recommendations.",
  "serving": "Suggested side pairings or beverages.",
  "storage": "Storage shelf-life and reheating instructions.",
  "cost": "Low" | "Medium" | "High",
  "healthScore": 8.5,
  "benefits": [
    "Nutritional benefit statement 1",
    ...
  ],
  "substitutions": [
    {
      "original": "ingredient name",
      "substitute": "substitute name",
      "notes": "substitution details"
    },
    ...
  ],
  "funFact": "Interesting history, chemical science, or culinary fact about this dish."
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || 'Failed to call Gemini API';
      throw new Error(errorMsg);
    }

    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      throw new Error('Gemini API returned an empty response');
    }

    const recipeJSONText = data.candidates[0].content.parts[0].text;
    const recipeObject = JSON.parse(recipeJSONText);

    res.json({ recipe: recipeObject });
  } catch (error) {
    console.error('Generative AI Error:', error.message);
    res.status(500).json({ error: `Generative AI Error: ${error.message}. Double check your API key.` });
  }
});

// Frontend static files served automatically via express.static middleware

// Start Server
app.listen(PORT, () => {
  console.log(`Vanta AI Server running at http://localhost:${PORT}`);
});

// Export app instance for Vercel Serverless Functions
module.exports = app;
