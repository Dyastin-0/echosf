FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build         ./build
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
ENV PORT=42020
EXPOSE 42020
CMD ["node", "build"]
