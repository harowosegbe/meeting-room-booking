# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app
ENV NODE_ENV=development

# Install deps (incl dev) first for better caching
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build   # produces dist/index.js

# ---------- Runner ----------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Only install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# (Optional) copy any runtime-only files (e.g., healthcheck)
# If your healthcheck is TS, copy the built JS instead:
# COPY --from=builder /app/dist/healthcheck.js ./healthcheck.js
# or if it's plain JS in repo:
COPY healthcheck.js ./healthcheck.js

# Create non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["npm", "start"]