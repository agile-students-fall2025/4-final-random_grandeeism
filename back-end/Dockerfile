# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 7001

# Set environment to production by default
ENV NODE_ENV=production

# Start the application
CMD ["node", "index.js"]
