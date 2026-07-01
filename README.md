# 🍽️ Vanta AI — AI-Powered Recipe Generator

<div align="center">

![Vanta AI](https://img.shields.io/badge/Vanta-AI-00e676?style=for-the-badge&logo=google&logoColor=white)
![Gemini](https://img.shields.io/badge/Powered%20by-Gemini%202.5-4285F4?style=for-the-badge&logo=google&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Vanta AI is a next-generation, AI-powered recipe generator that acts as your personal Michelin Star Chef.**  
Just tell it what ingredients you have, and it creates a complete, personalized recipe with nutrition info, cooking tips, and more.

[🌐 Live Demo](https://vanta-ai.vercel.app) · [🐛 Report Bug](https://github.com/UgguMan/Vanta-AI-/issues) · [✨ Request Feature](https://github.com/UgguMan/Vanta-AI-/issues)

</div>

---

## ✨ Features

- 🤖 **AI Recipe Generation** — Powered by Google Gemini 2.5 Flash
- 🧑‍🍳 **Michelin-Level Output** — Full recipe with instructions, plating, storage, and tips
- 🥗 **Nutrition Analysis** — Calories, protein, carbs, fat, fiber per recipe
- ❤️ **Save Favorites** — Bookmark recipes to your personal collection (requires account)
- 👤 **User Authentication** — Sign up / Log in with username & password
- 🔐 **Google Sign-In** — One-click Google OAuth login
- 🛡️ **Admin Dashboard** — Manage users and view app stats
- 🌍 **Cuisine Filters** — Indian, Italian, Mexican, Japanese, and more
- 🌿 **Diet Preferences** — Vegan, Vegetarian, Keto, Paleo, Gluten-Free, and more
- ⏱️ **Cooking Time & Difficulty** — Recipes tailored to your schedule and skill level
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3 (Glassmorphism UI), Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **AI** | Google Gemini 2.5 Flash API |
| **Auth** | JWT Tokens, bcrypt, Google OAuth2 |
| **Hosting** | Vercel (Serverless) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier works)
- [Google Gemini API Key](https://aistudio.google.com/) (free)

### 1. Clone the Repository

```bash
git clone https://github.com/UgguMan/Vanta-AI-.git
cd Vanta-AI-
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vantaai

# Google OAuth (optional — leave blank to use Demo mode)
GOOGLE_CLIENT_ID=your_google_client_id_here

# Admin Account Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Server Port
PORT=3000
```

### 4. Run the App

```bash
npm start
```

Open your browser at **http://localhost:3000** 🎉

---

## 🌐 Deploying to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "initial commit"
git push origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Go to **Settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `GEMINI_API_KEY` | Your Gemini API key |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `admin123` |

4. Click **Deploy** ✅

> ⚠️ **Important:** In MongoDB Atlas → **Network Access**, add `0.0.0.0/0` to allow Vercel's dynamic IPs.

---

## 📁 Project Structure

```
Vanta-AI-/
├── index.html          # Main frontend UI
├── app.js              # Frontend JavaScript logic
├── styles.css          # UI styles (Glassmorphism theme)
├── inspect.js          # Admin dashboard scripts
├── server.js           # Express.js backend + API routes
├── vercel.json         # Vercel deployment configuration
├── package.json        # Node.js dependencies
├── .env                # Environment variables (not committed)
└── .gitignore          # Git ignore rules
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate` | Generate a recipe using Gemini AI |
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login with username/password |
| `POST` | `/api/auth/google` | Login with Google OAuth |
| `GET` | `/api/auth/me` | Get current user profile |
| `GET` | `/api/favorites` | Get user's saved favorites |
| `POST` | `/api/favorites` | Save a recipe to favorites |
| `DELETE` | `/api/favorites/:id` | Remove a favorite |
| `GET` | `/api/admin/stats` | Admin: Get app statistics |
| `GET` | `/api/admin/users` | Admin: Get all users |
| `DELETE` | `/api/admin/users/:id` | Admin: Delete a user |

---

## 🧑‍💻 Admin Access

Login with the seeded admin account:

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

> Change these in your `.env` file or Vercel Environment Variables.

---

## 📸 Screenshots

> Coming soon...

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**UgguMan**  
GitHub: [@UgguMan](https://github.com/UgguMan)

---

<div align="center">
Made with ❤️ and powered by Google Gemini AI
</div>
