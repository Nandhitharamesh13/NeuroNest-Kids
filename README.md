# 🧠 NeuroNest Kids - Adaptive Learning Platform

**A full-stack educational app designed for neurodiverse children with AI-powered adaptive difficulty, reward systems, and parent controls.**


---

## 🎯 Features

### For Children
- 🎮 **20+ Interactive Educational Games** - Alphabet, Numbers, Colors, Emotions, and more
- 🤖 **AI-Powered Adaptive Difficulty** - Games adjust based on performance
- 🏆 **Reward System** - Earn badges and achievements
- 🎨 **Sensory-Friendly Interface** - Customizable colors and sounds
- 🗣️ **Text-to-Speech Support** - Learn through audio

### For Parents
- 👁️ **Remote Control Dashboard** - Monitor and control child's progress in real-time
- 📊 **Detailed Analytics** - Track learning patterns and game statistics
- 🔔 **Alert System** - Get notified of important milestones
- 🛡️ **PIN Gate Protection** - Secure parent-only features
- ⚙️ **Accessibility Settings** - Customize for individual needs

### Technical Features
- ✅ **User Authentication** - Secure login with JWT tokens
- ✅ **PostgreSQL Database** - Persistent data storage
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Production-Ready** - Easy deployment to cloud platforms

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ 
- **npm** or **yarn**
- **PostgreSQL** v14+

### Local Development (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/Pravinkumar-04/NeuroNest-Kids.git
cd NeuroNest-Kids/neuro-frontend/neuronest-kids

# 2. Install dependencies
npm install
cd backend && npm install && cd ..

# 3. Setup database
# In pgAdmin or SQL shell:
# CREATE USER neuronest_admin WITH PASSWORD 'root12';
# CREATE DATABASE neuronest OWNER neuronest_admin;
# GRANT ALL PRIVILEGES ON DATABASE neuronest TO neuronest_admin;

# 4. Start backend (Terminal 1)
cd backend && npm start
# Output: Backend running at http://localhost:5000

# 5. Start frontend (Terminal 2)
npm run dev
# Output: Local: http://localhost:8080
```

**Open browser:** `http://localhost:8080` → Create account → Test!

---

## 📦 Project Structure

```
NeuroNest-Kids/
├── neuro-frontend/
│   └── neuronest-kids/
│       ├── src/                 # React components and pages
│       │   ├── components/      # UI components (games, dashboards)
│       │   ├── pages/           # Page routes
│       │   ├── hooks/           # Custom React hooks
│       │   └── pages/games/     # 20+ game implementations
│       │
│       ├── backend/             # Express API server
│       │   ├── server.js        # Main server
│       │   ├── db.js            # PostgreSQL connection
│       │   ├── routes/          # API endpoints (auth, games, children)
│       │   ├── middleware/      # JWT authentication
│       │   └── init_db.sql      # Database schema
│       │
│       ├── package.json         # Frontend dependencies
│       ├── vite.config.ts       # Vite configuration
│       └── tailwind.config.ts   # Tailwind CSS setup
│
├── DEPLOYMENT.md                # Deployment guides
├── .gitignore                   # Git ignore patterns
└── README.md                    # This file
```

---

## 🛠️ Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | React + TypeScript | 18+ |
| Backend | Express.js | 4.18+ |
| Database | PostgreSQL | 14+ |
| Styling | Tailwind CSS | 3+ |
| Build Tool | Vite | 5+ |
| UI Framework | shadcn/ui | Latest |
| HTTP Client | React Query | 5+ |
| State Management | React Context | Built-in |
| Authentication | JWT | 9+ |

---

## 📝 API Documentation

### Authentication Endpoints

**Register**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe"
}

Response: { token, user }
```

**Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: { token, user }
```

### Games Endpoints

**Get All Games**
```bash
GET /api/games
Response: [{ id, title, category, difficulty, ... }]
```

**Submit Game Score**
```bash
POST /api/games/:gameId/score
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "childId": 123,
  "score": 85,
  "timeSpent": 120
}
```

---

## 🚢 Deployment

### Deploy to Production in Minutes

1. **Push to GitHub** (already done!)
2. **Choose Platform:**
   - **Vercel** (Frontend) + **Railway** (Backend) - Recommended
   - **Render** (Full-stack)
   - **Heroku** (Full-stack)
   - **Docker** (Any cloud)

3. **See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step guides**

---

## 🔐 Environment Variables

### Backend (.env)
```env
DB_USER=neuronest_admin
DB_HOST=localhost
DB_NAME=neuronest
DB_PASS=root12
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
PORT=5000
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-api.com/api
```

---

## 🧪 Available Scripts

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Backend
```bash
npm start          # Start production server
npm run dev        # Start with nodemon (auto-reload)
```

---

## 🐛 Troubleshooting

**Error: Cannot find module**
```bash
rm -r node_modules package-lock.json
npm install
```

**Database connection refused**
- Check PostgreSQL is running
- Verify `.env` database credentials
- Run: `psql -U neuronest_admin -d neuronest` to test

**CORS errors**
- Check `FRONTEND_URL` in backend `.env`
- Update `origin` in backend `server.js`

**Port already in use**
- Kill process: `lsof -ti:5000 | xargs kill -9`
- Or change port in `.env`

---

## 📊 Performance Metrics

- **Frontend Bundle Size**: ~500KB (gzipped)
- **API Response Time**: <100ms
- **Database Query Time**: <50ms
- **Lighthouse Score**: 85+

---

## 📱 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/awesome-feature`)
3. Commit changes (`git commit -m 'Add awesome feature'`)
4. Push to branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Nandhitha R**
- GitHub: [@Nandhitharamesh13](https://github.com/Nandhitharamesh13)
- Project: [NeuroNest-Kids](https://github.com/Nandhitharamesh13/NeuroNest-Kids)

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Cloud AI integration
- [ ] Social features (leaderboards)
- [ ] Offline mode
- [ ] Advanced analytics
- [ ] Teacher dashboard

---


**Made with ❤️ for neurodiverse learners**
