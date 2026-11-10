# InfraScan Backend Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app:/app/ai-model

WORKDIR /app

# Install system dependencies for OpenCV and image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt /app/backend-requirements.txt
COPY ai-model/requirements.txt /app/ai-requirements.txt

RUN pip install --no-cache-dir -r /app/backend-requirements.txt \
    && pip install --no-cache-dir -r /app/ai-requirements.txt

# Copy source code
COPY backend /app/backend
COPY ai-model /app/ai-model

WORKDIR /app/backend

# Create uploads directory
RUN mkdir -p uploads/raw uploads/inspections uploads/preprocessed uploads/reports

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

