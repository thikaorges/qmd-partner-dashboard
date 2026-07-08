# Stage 1: Build frontend
FROM node:18-bullseye AS frontend-build

WORKDIR /app/frontend

ENV SKIP_PREFLIGHT_CHECK=true
ENV DISABLE_ESLINT_PLUGIN=true
ENV NODE_OPTIONS=--openssl-legacy-provider

COPY frontend/package.json ./
RUN npm install --legacy-peer-deps
RUN npm install ajv@^8.17.1 ajv-keywords@^5.1.0 --legacy-peer-deps

COPY frontend/ ./
RUN npm run build

# Stage 2: Backend + serve frontend
FROM python:3.11-slim

WORKDIR /app

# Install backend deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy built frontend
COPY --from=frontend-build /app/frontend/build ./static

# Copy backend
COPY backend/ ./backend/

EXPOSE 8000

ENV PORT=8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
