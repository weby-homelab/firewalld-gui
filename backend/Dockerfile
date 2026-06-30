FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y iproute2 kmod iptables firewalld fail2ban && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
ENV PORT=8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --reload"]
