<p align="center">
  <a href="INSTRUCTIONS_ENG.md">
    <img src="https://img.shields.io/badge/🇬🇧_English-00D4FF?style=for-the-badge&logo=readme&logoColor=white" alt="English README">
  </a>
  <a href="INSTRUCTIONS.md">
    <img src="https://img.shields.io/badge/🇺🇦_Українська-FF4D00?style=for-the-badge&logo=readme&logoColor=white" alt="Українська версія">
  </a>
</p>

<br>

# 🛡️ Firewalld-GUI: Bare-Metal Installation (No Docker)
*Detailed guide for the `classic` branch (direct host installation).*

## 📋 Table of Contents
1. [Introduction](#1-introduction)
2. [Installation (Bare-Metal)](#2-installation-bare-metal)
3. [First Run & Onboarding](#3-first-run--onboarding)
4. [Dashboard Features](#4-dashboard-features)
5. [Pro Tips](#5-pro-tips)

---

## 1. Introduction
This guide is for administrators who wish to install **Firewalld-GUI** directly on their system (Bare-Metal, LXC, VPS) without Docker. This method ensures maximum performance and direct access to firewall system processes.

---

## 2. Installation (Bare-Metal)

### Step 1: Install System Dependencies
For AlmaLinux 9/10:
```bash
dnf install -y python3 python3-pip firewalld fail2ban nginx epel-release
dnf module enable -y nodejs:20
dnf install -y nodejs npm
```

For Ubuntu 24.04:
```bash
apt update
apt install -y python3 python3-pip python3-venv firewalld fail2ban nginx nodejs npm
```

Enable core services:
```bash
systemctl enable --now firewalld fail2ban
```

### Step 2: Download the Code
```bash
git clone -b classic https://github.com/weby-homelab/firewalld-gui.git /opt/firewalld-gui
```

### Step 3: Build the Frontend (React)
```bash
cd /opt/firewalld-gui/frontend
npm install
npm run build
```
Once complete, the optimized files will be in the `dist/` directory.

### Step 4: Setup the Backend (Python)
```bash
cd /opt/firewalld-gui/backend
pip3 install -r requirements.txt
```
*(On Ubuntu, you might need to use a venv if the system blocks global pip installs).*

### Step 5: Configure Nginx
Create the configuration file `/etc/nginx/conf.d/firewalld-gui.conf` (or in `sites-available` for Ubuntu):
```nginx
server {
    listen 8080;
    root /opt/firewalld-gui/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 6: Create the Systemd Service
Create the file `/etc/systemd/system/firewalld-backend.service`:
```ini
[Unit]
Description=Firewalld-GUI Backend
After=network.target firewalld.service fail2ban.service

[Service]
WorkingDirectory=/opt/firewalld-gui/backend
ExecStart=/usr/local/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
User=root
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```
*(Ensure the path to `uvicorn` is correct for your system, e.g., `/usr/bin/uvicorn` or the venv path).*

### Step 7: Start and Open Ports
```bash
systemctl daemon-reload
systemctl enable --now firewalld-backend nginx

# Allow access to the panel port
firewall-cmd --add-port=8080/tcp --permanent
firewall-cmd --reload
```
The panel will now be available at `http://YOUR_SERVER_IP:8080`.

---

## 3. First Run & Onboarding
On your first visit, you will see the **"Welcome to Firewalld-GUI"** screen.
1. Enter the login and password for your first account (Superadmin).
2. Click **"Setup Admin Account"**.
3. You will be automatically redirected to the main dashboard.

---

## 4. Dashboard Features

- **Config:** Manage Zones, Policies, Services, IP Sets, and Rich Rules.
- **Monitoring:** Attack graphs, blocked IP list, Geo-IP integration.
- **Snapshots:** Every configuration change creates an automatic backup of `/etc/firewalld`. You can rollback in 1 click.
- **Admin:** User management, Audit Logs, and Telegram Alerts configuration.

---

## 5. Pro Tips
### 🛡️ Safe Port Migration
Afraid of changing the SSH port and locking yourself out?
1. In the Config tab, click **"🛡️ Safe Migrate"**.
2. Enter the new port. The system will add it alongside the existing one.
3. Test your connection on the new port.
4. If everything is OK, remove the old port.

---
**✦ 2026 Weby Homelab ✦**
