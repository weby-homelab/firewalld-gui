# --- Stage 1: Build React Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Final Image ---
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies (Firewalld, fail2ban)
RUN apt-get update && apt-get install -y \
    firewalld \
    fail2ban \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# Copy built frontend to backend static directory
COPY --from=frontend-builder /app/frontend/dist /app/static

EXPOSE 8649

ENV PORT=8649
ENV TZ=Europe/Kyiv
ENV DATA_DIR=/app/data

# Create non-root user for runtime
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser \
    && chown -R appuser:appuser /app

USER appuser

# Run FastAPI
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8649}"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8649}/health')" || exit 1

