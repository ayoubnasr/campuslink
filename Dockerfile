# CampusLink: one container serving the Express API and the built React app.

# ---- Build stage: install dependencies and build the frontend ----
FROM node:22-slim AS build
WORKDIR /app

COPY backend/package.json backend/package-lock.json backend/
COPY frontend/package.json frontend/package-lock.json frontend/
RUN npm --prefix backend ci --omit=dev && npm --prefix frontend ci

COPY backend backend
COPY frontend frontend
RUN npm --prefix frontend run build

# ---- Runtime stage: backend + built frontend only ----
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/backend backend
COPY --from=build /app/frontend/build frontend/build

EXPOSE 5000

# Create/update the database schema and procedures (safe to repeat), then start the server.
CMD ["sh", "-c", "cd backend && node scripts/init-db.js && cd src/Server && exec node server.js"]
