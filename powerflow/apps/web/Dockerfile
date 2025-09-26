FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json ./
COPY next.config.js ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY src ./src
COPY public ./public

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built application
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

EXPOSE 3000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["pnpm", "start"]