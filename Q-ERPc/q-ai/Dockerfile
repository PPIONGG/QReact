# Stage 1: Build the application
FROM node:23-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build arguments
ARG BACKEND_BASE_URL
ARG BACKEND_JWT_KEY
# Create .env file for build
RUN echo "VITE_BACKEND_BASE_URL=${BACKEND_BASE_URL}" > .env.local
RUN echo "VITE_BACKEND_JWT_KEY=${BACKEND_JWT_KEY}" >> .env.local

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
