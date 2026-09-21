FROM node:20-slim

WORKDIR /app

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client and compile TypeScript
RUN npx prisma generate
RUN npm run build

# Set environment and expose port
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Start the compiled backend with automated DB sync & seed
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx ts-node prisma/seed.ts && npm start"]
