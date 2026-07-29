# Production Deployment Instructions

## 1. Clone the Repository
```bash
git clone https://github.com/Nandhitharamesh13/NeuroNest-Kids.git
cd NeuroNest-Kids
```

## 2. Create Production Environment Files

### Backend
```bash
cp .env.production.example neuro-frontend/neuronest-kids/backend/.env
# Edit and fill in your production values
```

### Frontend
```bash
cp neuro-frontend/neuronest-kids/.env.example neuro-frontend/neuronest-kids/.env.production
# Update VITE_API_URL to your production backend
```

## 3. Deploy with Docker

### Option A: Run Locally
```bash
docker-compose up -d
# Backend: http://localhost:5000
# Frontend: http://localhost:80
```

### Option B: Deploy to Cloud

**Railway.app:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
railway init
railway up
```

**Render.com:**
1. Push to GitHub
2. Go to render.com → Dashboard → New Web Service
3. Connect repository
4. Set environment variables
5. Deploy

**AWS EC2:**
```bash
# SSH into your instance
ssh -i key.pem ec2-user@your-instance

# Install Docker and Docker Compose
sudo yum install docker docker-compose

# Clone and deploy
git clone https://github.com/Nandhitharamesh13/NeuroNest-Kids.git
cd NeuroNest-Kids
docker-compose up -d
```

## 4. Verify Deployment

```bash
# Check backend
curl https://your-domain.com/api/

# Check frontend loads
open https://your-domain.com

# View logs
docker-compose logs -f backend
```

## 5. Post-Deployment

- [ ] Update DNS records
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Set up monitoring/alerts
- [ ] Backup database regularly
- [ ] Monitor application logs

---

**For detailed deployment guides, see DEPLOYMENT.md**
