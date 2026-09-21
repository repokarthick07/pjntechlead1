FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for build)
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

# Start the compiled backend
CMD ["npm", "start"]
