# =======================================================
# Dockerfile for React Invigilator Dashboard (Vite)
# =======================================================

FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install || true

# Copy rest of frontend files
COPY . .

EXPOSE 5173

# Run Vite with --host to bind to all interfaces inside container
CMD ["npm", "run", "dev", "--", "--host"]
