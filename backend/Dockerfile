FROM node:20-slim

WORKDIR /app

# Install OpenSSL required by Prisma
RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 5000

# Push database schema and start server
CMD ["sh", "-c", "npx prisma db push && node server.js"]