# 🚀 NeuroNest Kids - Deployment Guide

This guide explains how to deploy **NeuroNest Kids** to production on various platforms.

---

## 📋 Prerequisites

- Node.js v18+ installed
- PostgreSQL database (can be hosted on RDS, Railway, or Supabase)
- GitHub account (code already hosted)
- Deployment platform account (Vercel, Railway, Render, or Heroku)

---

## 🔧 Production Environment Setup

### Backend Environment Variables

Create `.env` in `backend/` folder with **production values**:

```env
# Production Database
DB_USER=your_db_user
DB_HOST=your_db_host.rds.amazonaws.com    # or Railway, Supabase host
DB_NAME=neuronest_prod
DB_PASS=your_secure_password              # Use strong password!
DB_PORT=5432

# Frontend URL (for CORS)
FRONTEND_URL=https://neuronest-kids.vercel.app

# API Configuration
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this

# AI Server URL (if using cloud AI service)
AI_SERVER_URL=https://your-ai-server.com
```

### Frontend Environment Variables

Create `.env.production` in `neuronest-kids/` folder:

```env
VITE_API_URL=https://your-api.com/api
VITE_ENV=production
```

---

## 🌐 Option 1: Deploy to Vercel + Railway (RECOMMENDED)

### Step 1: Deploy Frontend to Vercel

1. Go to: https://vercel.com/new
2. Import from GitHub: `Pravinkumar-04/NeuroNest-Kids`
3. Configure:
   - **Root Directory**: `neuro-frontend/neuronest-kids`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://your-railway-backend.up.railway.app/api`
5. Deploy ✅

### Step 2: Deploy Backend to Railway

1. Go to: https://railway.app
2. Create new project → Import from GitHub
3. Select `NeuroNest-Kids` repository
4. Configure:
   - **Root Directory**: `neuro-frontend/neuronest-kids/backend`
   - **Start Command**: `npm start`
5. Add PostgreSQL plugin → Railway automatically creates database
6. Set environment variables (copy from `.env` template above)
7. Deploy ✅

### Step 3: Connect Frontend to Backend

1. Get your Railway backend URL (e.g., `https://neuronest-backend.up.railway.app`)
2. Go to Vercel dashboard → Settings → Environment Variables
3. Update `VITE_API_URL` with Railway backend URL
4. Redeploy Vercel

---

## 🚀 Option 2: Deploy to Render (Full-Stack)

### Step 1: Deploy Backend

1. Go to: https://render.com
2. Create new **Web Service**
3. Connect GitHub repository
4. Configure:
   - **Name**: `neuronest-api`
   - **Environment**: `Node`
   - **Root Directory**: `neuro-frontend/neuronest-kids/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add PostgreSQL database in Render
6. Set all environment variables
7. Deploy

### Step 2: Deploy Frontend

1. Create new **Static Site**
2. Connect GitHub repository
3. Configure:
   - **Name**: `neuronest-kids`
   - **Root Directory**: `neuro-frontend/neuronest-kids`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables (VITE_API_URL)
5. Deploy

---

## 🐳 Option 3: Deploy with Docker

Create `Dockerfile` for backend:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/. ./

EXPOSE 5000
CMD ["npm", "start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    environment:
      DB_HOST: postgres
      DB_USER: ${DB_USER}
      DB_PASS: ${DB_PASS}
      DB_NAME: ${DB_NAME}
```

Deploy:
```bash
docker-compose up -d
```

---

## ✅ Post-Deployment Checklist

- [ ] Frontend loads at `https://your-domain.com`
- [ ] Backend API responds at `https://your-api.com/api/auth/register`
- [ ] Login/Register functionality works
- [ ] Database stores user data
- [ ] CORS is properly configured
- [ ] JWT tokens work correctly
- [ ] No console errors in browser DevTools
- [ ] SSL certificate is valid

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong JWT_SECRET** - Change from default
3. **Use strong DB passwords** - Minimum 16 characters
4. **Enable HTTPS** - All production URLs must be HTTPS
5. **Restrict CORS** - Only allow your frontend domain
6. **Use environment variables** - Never hardcode secrets

---

## 📞 Troubleshooting

**"Cannot find module" errors?**
```bash
cd backend && npm install
cd ../.. && npm install
```

**Database connection failed?**
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Check firewall rules

**CORS errors?**
- Update `origin` in backend CORS config
- Add your domain to `.env` FRONTEND_URL

---

## 📚 Learn More

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **PostgreSQL Hosting**: https://www.elephantsql.com or Railway/Render

---

**Happy Deploying! 🎉**
