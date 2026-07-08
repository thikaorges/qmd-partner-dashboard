# Stage 1: Build frontend
FROM node:18-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --legacy-peer-deps

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
