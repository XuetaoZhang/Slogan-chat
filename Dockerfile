FROM node:18-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install dependencies
# We use --legacy-peer-deps in case of conflict, though strict install is better if clean
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the Socket server runs on
EXPOSE 3001

# Start the Socket server
CMD ["npm", "run", "server"]
