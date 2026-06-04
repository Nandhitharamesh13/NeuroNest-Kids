# 🚀 NeuroNest Kids — Getting Started Guide (Beginner Friendly)

This guide explains how to set up and run the **NeuroNest Kids** learning app from scratch.

---

## 📋 Prerequisites

Before you begin, make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | v18 or higher | https://nodejs.org |
| **npm** | (comes with Node.js) | — |
| **PostgreSQL** | v14 or higher | https://www.postgresql.org/download |

To verify your installs, open a terminal and run:
```bash
node -v       # Should print v18.x.x or higher
npm -v        # Should print 9.x.x or higher
psql --version  # Should print PostgreSQL 14 or higher
```

---

## 🗂️ Project Structure

```
neuronest-kids/
├── backend/          ← Node.js Express API server (port 5000)
│   ├── db.js         ← PostgreSQL connection pool
│   ├── server.js     ← Main server entry point
│   ├── routes/       ← API route handlers (auth, games, children)
│   ├── middleware/   ← JWT auth middleware
│   └── init_db.sql   ← Database setup script
├── ai-server/        ← AI difficulty server (port 7000)
├── src/              ← React frontend (Vite)
└── GETTING_STARTED.md
```

---

## 🛢️ Step 1 — Set Up PostgreSQL Database

### 1a. Start PostgreSQL
On Windows, open **pgAdmin** or start the PostgreSQL service:
```powershell
# Check if PostgreSQL is running (Windows)
Get-Service -Name postgresql*
```

### 1b. Create the database and user
Open **pgAdmin** or the **psql** shell and run:
```sql
-- Create the database user
CREATE USER neuronest_admin WITH PASSWORD 'root12';

-- Create the database
CREATE DATABASE neuronest OWNER neuronest_admin;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE neuronest TO neuronest_admin;
```

### 1c. Set up the tables
Run the initialization SQL file:
```bash
psql -U neuronest_admin -d neuronest -f backend/init_db.sql
```
> If asked for a password, enter: `root12`

---

## ⚙️ Step 2 — Configure Environment Variables

The backend `.env` file is already configured at `backend/.env`:
```env
DB_USER=neuronest_admin
DB_HOST=localhost
DB_NAME=neuronest
DB_PASS=root12
DB_PORT=5432
JWT_SECRET=neuronest_jwt_super_secret_2024_pravin
PORT=5000
```

> **Do not share this file publicly.** It contains database credentials.

---

## 📦 Step 3 — Install Dependencies

You need to install packages for **3 separate parts** of the app.

### 3a. Frontend (React + Vite)
```bash
# From the project root folder (neuronest-kids/)
npm install
```

### 3b. Backend (Express + PostgreSQL)
```bash
cd backend
npm install
cd ..
```

### 3c. AI Server
```bash
cd ai-server
npm install
cd ..
```

---

## ▶️ Step 4 — Start All Servers

You need **3 terminal windows** running simultaneously.

### Terminal 1 — Backend API (port 5000)
```bash
cd backend
npm start
```
✅ You should see: `Backend running at http://localhost:5000`

### Terminal 2 — AI Server (port 7000)
```bash
cd ai-server
npm start
```
✅ You should see the AI server running message.

### Terminal 3 — Frontend (port 5173)
```bash
# From the project root
npm run dev
```
✅ You should see: `Local: http://localhost:5173`

---

## 🌐 Step 5 — Open the App

Open your browser and go to:
```
http://localhost:5173
```

---

## 🔐 Authentication

The app uses **custom PostgreSQL authentication** (not Supabase).

- **Register**: Click "Sign Up" → Enter your name, email, password
- **Login**: Click "Sign In" → Enter email and password
- Your session (JWT token) is stored in the browser automatically

---

## 🔧 Troubleshooting

### "Cannot connect to database"
- Make sure PostgreSQL is running
- Verify the credentials in `backend/.env` match your PostgreSQL setup
- Try: `psql -U neuronest_admin -d neuronest` (should connect)

### "Port already in use"
- Backend uses port **5000** — make sure no other app is using it
- AI server uses port **7000**
- Frontend uses port **5173**

```powershell
# Check what's on a port (e.g. 5000)
netstat -ano | findstr :5000
```

### "Module not found" errors
- Make sure you ran `npm install` in ALL 3 folders
- Try deleting `node_modules` and running `npm install` again

### Backend won't start
- Check if `backend/.env` exists with the correct values
- Make sure PostgreSQL is running and accessible

---

## 📚 Quick Reference — All Commands

```bash
# === ONE-TIME SETUP ===
npm install                   # Frontend dependencies
cd backend && npm install     # Backend dependencies
cd ai-server && npm install   # AI server dependencies

# === RUN THE APP (3 terminals) ===
cd backend && npm start       # Terminal 1: API server
cd ai-server && npm start     # Terminal 2: AI server  
npm run dev                   # Terminal 3: Frontend

# === DATABASE SETUP ===
psql -U neuronest_admin -d neuronest -f backend/init_db.sql
```

---

## 🎮 Games Available

- 🔤 Alphabet Game (letter recognition, 5 strategy types)
- 🔢 Numbers Game
- 🎨 Colors Game
- 🐾 Animals Game
- 🌤️ Weather Game
- ⏰ Clock Game
- + 15 more learning games!

---

*Built with ❤️ by the NeuroNest team using React, Vite, Node.js, and PostgreSQL.*
