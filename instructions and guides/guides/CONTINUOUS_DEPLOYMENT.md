# Continuous Deployment Setup

This guide explains how to set up Continuous Deployment (CD) with GitHub Actions to automatically deploy your containerized application to Digital Ocean when changes are pushed to the repository.

## Overview

The CD pipeline will:
1. Trigger on pushes to the `main` branch
2. Build Docker images
3. Push images to Docker Hub (or GitHub Container Registry)
4. Deploy to Digital Ocean Droplet via SSH
5. Pull latest images and restart services

## Prerequisites

- GitHub repository
- Docker Hub account (or use GitHub Container Registry)
- Digital Ocean Droplet with Docker installed
- SSH access to the droplet

## Step 1: Set Up GitHub Secrets

Add the following secrets to your GitHub repository:

Go to: **Settings → Secrets and variables → Actions → New repository secret**

### Required Secrets

1. **DOCKERHUB_USERNAME** - Your Docker Hub username
2. **DOCKERHUB_TOKEN** - Docker Hub access token (create at hub.docker.com/settings/security)
3. **DO_SSH_PRIVATE_KEY** - SSH private key for Digital Ocean droplet
4. **DO_HOST** - IP address of your Digital Ocean droplet
5. **DO_USERNAME** - SSH username (usually `root`)
6. **MONGODB_URI** - MongoDB connection string
7. **JWT_SECRET** - JWT secret key

### Creating SSH Keys for Digital Ocean

```bash
# Generate new SSH key pair
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Display private key (add to GITHUB_SECRETS as DO_SSH_PRIVATE_KEY)
cat ~/.ssh/github_actions

# Copy public key to Digital Ocean droplet
ssh-copy-id -i ~/.ssh/github_actions.pub root@YOUR_DROPLET_IP
```

## Step 2: Create GitHub Actions Workflow

Create the workflow file in your repository:

`.github/workflows/deploy.yml`

```yaml
name: Deploy to Digital Ocean

on:
  push:
    branches: [ main ]
  workflow_dispatch:  # Allow manual trigger

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      # Checkout code
      - name: Checkout code
        uses: actions/checkout@v4

      # Set up Docker Buildx
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # Log in to Docker Hub
      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      # Build and push backend image
      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./back-end
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/fieldnotes-backend:latest
          cache-from: type=registry,ref=${{ secrets.DOCKERHUB_USERNAME }}/fieldnotes-backend:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKERHUB_USERNAME }}/fieldnotes-backend:buildcache,mode=max

      # Build and push frontend image
      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./front-end
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/fieldnotes-frontend:latest
          cache-from: type=registry,ref=${{ secrets.DOCKERHUB_USERNAME }}/fieldnotes-frontend:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKERHUB_USERNAME }}/fieldnotes-frontend:buildcache,mode=max

      # Deploy to Digital Ocean
      - name: Deploy to Digital Ocean
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.DO_HOST }}
          username: ${{ secrets.DO_USERNAME }}
          key: ${{ secrets.DO_SSH_PRIVATE_KEY }}
          script: |
            cd /root/fieldnotes
            
            # Create .env if it doesn't exist
            if [ ! -f .env ]; then
              echo "NODE_ENV=production" > .env
              echo "MONGODB_URI=${{ secrets.MONGODB_URI }}" >> .env
              echo "JWT_SECRET=${{ secrets.JWT_SECRET }}" >> .env
              echo "PORT=7001" >> .env
              echo "USE_MOCK_DB=false" >> .env
            fi
            
            # Pull latest images
            docker-compose pull
            
            # Restart services
            docker-compose up -d --force-recreate
            
            # Clean up old images
            docker image prune -af

      # Verify deployment
      - name: Verify deployment
        run: |
          sleep 10
          curl -f http://${{ secrets.DO_HOST }}/health || exit 1
```

## Step 3: Update docker-compose.yml for Production

Create a production version: `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  backend:
    image: ${DOCKERHUB_USERNAME}/fieldnotes-backend:latest
    container_name: fieldnotes-backend
    restart: unless-stopped
    ports:
      - "7001:7001"
    environment:
      - NODE_ENV=production
      - PORT=7001
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - USE_MOCK_DB=false
    networks:
      - fieldnotes-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:7001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: ${DOCKERHUB_USERNAME}/fieldnotes-frontend:latest
    container_name: fieldnotes-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - fieldnotes-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s

networks:
  fieldnotes-network:
    driver: bridge
```

## Step 4: Prepare Digital Ocean Droplet

SSH into your droplet and set up the deployment directory:

```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Create deployment directory
mkdir -p /root/fieldnotes
cd /root/fieldnotes

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    image: YOUR_DOCKERHUB_USERNAME/fieldnotes-backend:latest
    container_name: fieldnotes-backend
    restart: unless-stopped
    ports:
      - "7001:7001"
    environment:
      - NODE_ENV=production
      - PORT=7001
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - USE_MOCK_DB=false
    networks:
      - fieldnotes-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:7001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: YOUR_DOCKERHUB_USERNAME/fieldnotes-frontend:latest
    container_name: fieldnotes-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - fieldnotes-network

networks:
  fieldnotes-network:
    driver: bridge
EOF

# Create .env file with production secrets
nano .env
# Add your environment variables and save
```

## Step 5: Test the Pipeline

1. Make a small change to your code
2. Commit and push to main branch:

```bash
git add .
git commit -m "Test CD pipeline"
git push origin main
```

3. Monitor the workflow:
   - Go to GitHub → Actions tab
   - Watch the workflow execute
   - Check for any errors

4. Verify deployment:
   - Visit http://YOUR_DROPLET_IP
   - Check application functionality

## Alternative: GitHub Container Registry

If you prefer using GitHub Container Registry instead of Docker Hub:

### Update Secrets

Replace `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` with:
- **GHCR_TOKEN** - GitHub Personal Access Token with `write:packages` permission

### Update Workflow

```yaml
      # Log in to GitHub Container Registry
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GHCR_TOKEN }}

      # Build and push backend
      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./back-end
          push: true
          tags: ghcr.io/${{ github.repository }}/backend:latest
```

## Monitoring and Notifications

### Add Slack Notifications

Add to your workflow:

```yaml
      # Notify on success
      - name: Slack Notification
        if: success()
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_MESSAGE: 'Deployment successful! 🚀'
          SLACK_TITLE: 'FieldNotes Deployed'
          SLACK_COLOR: good
```

## Rollback Strategy

If a deployment fails:

```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

cd /root/fieldnotes

# List available images
docker images

# Use previous image
docker tag fieldnotes-backend:previous fieldnotes-backend:latest
docker-compose up -d --force-recreate
```

## Best Practices

1. **Branch Protection**: Require PR reviews before merging to main
2. **Testing**: Add automated tests that run before deployment
3. **Staging Environment**: Deploy to staging before production
4. **Monitoring**: Set up application monitoring (e.g., Datadog, New Relic)
5. **Backups**: Regular database backups before deployments
6. **Logging**: Centralized logging with tools like ELK stack or Papertrail

## Troubleshooting

### Workflow Fails at SSH Step

```bash
# Verify SSH key format
cat .ssh/github_actions | head -1  # Should show: -----BEGIN OPENSSH PRIVATE KEY-----

# Test SSH connection
ssh -i ~/.ssh/github_actions root@YOUR_DROPLET_IP
```

### Docker Build Fails

```bash
# Check Dockerfile syntax
docker build -t test ./back-end

# View build logs in GitHub Actions
```

### Deployment Succeeds but App Doesn't Work

```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Check logs
cd /root/fieldnotes
docker-compose logs

# Check environment variables
docker-compose exec backend env
```

## Extra Credit Verification

To verify continuous deployment for extra credit:

1. Show GitHub Actions workflow file
2. Demonstrate successful workflow run (green checkmark)
3. Show Docker Hub with pushed images
4. Prove automatic deployment by making a commit and showing it deploys

## Security Considerations

1. **Never expose secrets** in workflow files
2. **Use least privilege** for SSH access
3. **Rotate secrets regularly**
4. **Enable 2FA** on Docker Hub and GitHub
5. **Audit workflow logs** periodically

## Cost Optimization

- Use caching to speed up builds (already configured)
- Clean up old images regularly
- Use smaller base images (alpine)
- Implement build matrix for parallel builds

## Next Steps

1. Add automated testing before deployment
2. Implement blue-green deployment
3. Set up monitoring and alerting
4. Configure SSL/TLS with Let's Encrypt
5. Add database backup automation

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Hub](https://hub.docker.com/)
- [Digital Ocean Tutorials](https://www.digitalocean.com/community/tutorials)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
