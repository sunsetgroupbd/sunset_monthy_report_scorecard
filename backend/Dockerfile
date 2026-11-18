# Multi-stage or optimized single-stage Python 3.12 slim image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8002

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY . .

# Ensure scorecard_local.db is not a directory from a prior failed volume mount
RUN if [ -d "/app/scorecard_local.db" ]; then rm -rf /app/scorecard_local.db; fi && \
    touch /app/scorecard_local.db

# Expose port 8002
EXPOSE 8002

# Start FastAPI with Uvicorn on port 8002
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
