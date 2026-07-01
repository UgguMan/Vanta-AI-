/**
 * ChefAI Database Inspector Utility (MongoDB Atlas Edition)
 * Run this script to view all registered users and stored favorites directly in your terminal.
 * Command: node inspect.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chefai';
console.log('Connecting to MongoDB database...');

MongoClient.connect(MONGODB_URI)
  .then(async (client) => {
    console.log('Connected successfully.\n');
    const db = client.db();
    
    await inspectData(db);
    
    await client.close();
    console.log('\nDatabase connection closed.');
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  });

async function inspectData(db) {
  console.log('=========================================');
  console.log('      VANTA AI MONGO DATABASE DUMP        ');
  console.log('=========================================\n');

  try {
    // Inspect Users
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    console.log(`--- REGISTERED USERS (${users.length}) ---`);
    if (users.length === 0) {
      console.log('No users registered yet.\n');
    } else {
      // Map _id to clean id field for printing
      const formattedUsers = users.map(u => ({ id: u._id.toString(), username: u.username }));
      console.table(formattedUsers);
      console.log('\n');
    }

    // Inspect Favorites
    const favorites = await db.collection('favorites').find({}).toArray();
    console.log(`--- SAVED RECIPE FAVORITES (${favorites.length}) ---`);
    if (favorites.length === 0) {
      console.log('No recipes saved to favorites yet.\n');
    } else {
      const formattedFavs = favorites.map(f => ({
        id: f._id.toString(),
        userId: f.userId,
        recipeId: f.recipeId,
        recipeName: f.recipeName
      }));
      console.table(formattedFavs);
      console.log('\n');
    }
  } catch (error) {
    console.error('Error querying collections:', error.message);
  }
  
  console.log('=========================================');
}
