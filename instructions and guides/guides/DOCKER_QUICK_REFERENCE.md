# Docker Quick Reference

Quick commands for Docker deployment.

## Local Development

### Start All Services
```bash
docker-compose up -d --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services
```bash
docker-compose down
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Check Service Status
```bash
docker-compose ps
```

## Access Points

- **Frontend**: http://localhost
- **Backend API**: http://localhost:7001/api
- **Health Check**: http://localhost:7001/health

## Common Issues

### Port Already in Use
```bash
# Find and kill process on port 80
sudo lsof -ti:80 | xargs kill -9

# Find and kill process on port 7001
sudo lsof -ti:7001 | xargs kill -9
```

### View Container Logs
```bash
docker logs fieldnotes-backend
docker logs fieldnotes-frontend
```

### Restart Single Service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Clean Everything
```bash
# Stop and remove containers
docker-compose down

# Remove all unused containers, networks, images
docker system prune -a
```

## Production Deployment

### Push to Docker Hub
```bash
# Login
docker login

# Build and tag
docker build -t username/fieldnotes-backend:latest ./back-end
docker build -t username/fieldnotes-frontend:latest ./front-end

# Push
docker push username/fieldnotes-backend:latest
docker push username/fieldnotes-frontend:latest
```

### Deploy to Digital Ocean
```bash
# SSH into droplet
ssh root@YOUR_IP

# Navigate to project
cd /root/fieldnotes

# Pull latest images
docker-compose pull

# Restart services
docker-compose up -d --force-recreate
```

## Environment Variables

Create `.env` file in root:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-secret-key-32-chars-minimum
PORT=7001
USE_MOCK_DB=false
```

## Health Checks

```bash
# Backend health
curl http://localhost:7001/health

# Frontend
curl http://localhost

# From production
curl http://YOUR_IP/health
```

## Continuous Deployment

### GitHub Actions automatically:
1. Builds Docker images on push to `main`
2. Pushes to Docker Hub
3. Deploys to Digital Ocean
4. Verifies deployment

See [CONTINUOUS_DEPLOYMENT.md](CONTINUOUS_DEPLOYMENT.md) for setup.

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker-compose logs backend

# Check environment
docker-compose exec backend env

# Restart
docker-compose restart backend
```

### Frontend 502 Error
```bash
# Check if backend is running
curl http://localhost:7001/health

# Check nginx config
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Restart both
docker-compose restart
```

### MongoDB Connection Failed
```bash
# Test connection
docker-compose exec backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected'))
  .catch(err => console.error(err));
"
```

## Resources

- [Docker Deployment Guide](DOCKER_DEPLOYMENT.md) - Full documentation
- [Continuous Deployment Guide](CONTINUOUS_DEPLOYMENT.md) - CI/CD setup
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
