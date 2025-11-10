FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/migrations ./src/migrations

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Expose the port the app runs on
EXPOSE 4000

# Run the application
CMD ["node", "dist/server.js"]
