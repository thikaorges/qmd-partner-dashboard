# Cache buster: 2026-07-08T12:05:00Z
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/jsconfig.json frontend/tailwind.config.js frontend/postcss.config.js frontend/craco.config.js ./
RUN npm install --legacy-peer-deps && npm install ajv@^8.17.1 --legacy-peer-deps

COPY frontend/public ./public
COPY frontend/src ./src

ARG REACT_APP_BACKEND_URL=""
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

RUN npm run build

# Stage 2: Backend + serve frontend
FROM python:3.11-slim

WORKDIR /app

# Install backend deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend
COPY backend/ ./backend/

# Copy built frontend
COPY --from=frontend-build /app/frontend/build ./static

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
