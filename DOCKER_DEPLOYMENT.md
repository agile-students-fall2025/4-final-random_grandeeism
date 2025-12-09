# Docker Deployment Guide

This guide explains how to deploy the FieldNotes application using Docker containers for the extra credit deployment requirement.

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- Git (to clone the repository)
- At least 4GB of available RAM

## Architecture

The application consists of three main components:

1. **Frontend** - React/Vite application served by Nginx (Port 80)
2. **Backend** - Node.js/Express API (Port 7001)
3. **Database** - MongoDB (using MongoDB Atlas cloud service or optional local container)

All services communicate through a Docker bridge network called `fieldnotes-network`.

## Quick Start

### 1. Clone the Repository (if not already done)

```bash
git clone <repository-url>
cd 4-final-random_grandeeism-6
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-user:your-password@your-cluster.mongodb.net/fieldnotes
JWT_SECRET=your-very-secure-secret-key-at-least-32-characters-long
PORT=7001
USE_MOCK_DB=false
```

**Important:** Never commit the `.env` file to version control!

### 3. Build and Start Services

Build the Docker images and start all services:

```bash
docker-compose up -d --build
```

This command will:
- Build the backend Docker image
- Build the frontend Docker image
- Create a Docker network
- Start all containers in detached mode

### 4. Verify Deployment

Check if all services are running:

```bash
docker-compose ps
```

You should see:
- `fieldnotes-backend` (running on port 7001)
- `fieldnotes-frontend` (running on port 80)

Check logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5. Access the Application

- **Frontend:** http://localhost
- **Backend API:** http://localhost:7001/api
- **Health Check:** http://localhost:7001/health

## Docker Commands Reference

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: deletes data)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f backend
```

### Rebuild Containers

After code changes:

```bash
# Rebuild all
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

### Execute Commands in Container

```bash
# Backend
docker-compose exec backend sh
docker-compose exec backend npm run test

# Frontend
docker-compose exec frontend sh
```

### View Container Stats

```bash
docker stats
```

## Using Local MongoDB (Optional)

If you prefer to use a local MongoDB container instead of MongoDB Atlas:

1. Uncomment the `mongodb` service in `docker-compose.yml`
2. Uncomment the `volumes` section at the bottom
3. Update your `.env` file:

```env
MONGODB_URI=mongodb://admin:changeme@mongodb:27017/fieldnotes?authSource=admin
MONGO_ROOT_PASSWORD=changeme
```

4. Rebuild and restart:

```bash
docker-compose down
docker-compose up -d --build
```

## Production Deployment to Digital Ocean

### Method 1: Using Docker Machine (Automated)

```bash
# Create droplet with Docker
docker-machine create --driver digitalocean --digitalocean-access-token=YOUR_TOKEN fieldnotes-production

# Configure shell
eval $(docker-machine env fieldnotes-production)

# Deploy
docker-compose up -d --build

# Get IP address
docker-machine ip fieldnotes-production
```

### Method 2: Manual Deployment

1. **Create a Digital Ocean Droplet**
   - Ubuntu 22.04 LTS
   - At least 2GB RAM
   - Enable monitoring

2. **SSH into the Droplet**

```bash
ssh root@YOUR_DROPLET_IP
```

3. **Install Docker and Docker Compose**

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

4. **Clone Repository**

```bash
git clone <repository-url>
cd 4-final-random_grandeeism-6
```

5. **Configure Environment**

```bash
# Create .env file
nano .env
```

Paste your production environment variables and save (Ctrl+X, Y, Enter).

6. **Deploy Application**

```bash
docker-compose up -d --build
```

7. **Configure Firewall**

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

8. **Access Application**

Visit `http://YOUR_DROPLET_IP` in your browser.

## Continuous Deployment Setup

For automatic deployments on push to GitHub, see `CONTINUOUS_DEPLOYMENT.md`.

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Invalid MONGODB_URI
# - Missing JWT_SECRET
# - Port 7001 already in use
```

### Frontend Shows 502 Bad Gateway

```bash
# Check if backend is healthy
docker-compose ps
curl http://localhost:7001/health

# Restart backend
docker-compose restart backend
```

### Cannot Connect to MongoDB

```bash
# Test MongoDB connection
docker-compose exec backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected!'))
  .catch(err => console.error('Error:', err));
"
```

### Rebuild Everything

```bash
# Stop and remove all containers
docker-compose down

# Remove images
docker-compose down --rmi all

# Clean build
docker-compose build --no-cache
docker-compose up -d
```

### View Container Resource Usage

```bash
docker stats
```

## Maintenance

### View Running Containers

```bash
docker ps
```

### Clean Up Unused Resources

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes
```

### Backup MongoDB Data (if using local container)

```bash
docker-compose exec mongodb mongodump --out /data/backup
docker cp fieldnotes-mongodb:/data/backup ./backup
```

## Security Considerations

1. **Environment Variables:** Never commit `.env` files to version control
2. **JWT Secret:** Use a strong, random secret key (32+ characters)
3. **MongoDB Password:** Use strong passwords for production
4. **HTTPS:** Configure SSL/TLS certificates (use Let's Encrypt with Certbot)
5. **Firewall:** Only expose necessary ports (80, 443, 22)
6. **Updates:** Regularly update Docker images and dependencies

## Performance Optimization

1. **Use Docker layer caching** - Order Dockerfile commands from least to most frequently changing
2. **Multi-stage builds** - Frontend Dockerfile uses multi-stage build to minimize image size
3. **Health checks** - Configured in docker-compose.yml for automatic restarts
4. **Resource limits** - Add memory/CPU limits in docker-compose.yml if needed:

```yaml
services:
  backend:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

## Support

For issues or questions:
1. Check container logs: `docker-compose logs`
2. Verify environment variables: `docker-compose config`
3. Review health status: `docker-compose ps`

## Extra Credit Documentation

This deployment implements:
- ✅ Docker containerization (backend + frontend)
- ✅ Docker Compose orchestration
- ✅ Multi-stage builds for optimization
- ✅ Health checks for reliability
- ✅ Production-ready nginx configuration
- ✅ Network isolation with Docker bridge network

For Continuous Deployment setup with GitHub Actions, see `CONTINUOUS_DEPLOYMENT.md`.
