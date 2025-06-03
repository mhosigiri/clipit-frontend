# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://backend:8080

# Run the application
CMD ["npm", "start"]