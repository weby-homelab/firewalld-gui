FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y iproute2 kmod iptables firewalld fail2ban systemd && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
