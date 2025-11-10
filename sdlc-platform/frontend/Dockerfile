# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage to nginx serve directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port nginx is running on
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
