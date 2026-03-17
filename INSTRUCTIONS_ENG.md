# 🛡️ Firewalld-GUI: From Zero to Hero
*Comprehensive guide for installation, configuration, and professional use.*

## 📋 Table of Contents
1. [Introduction](#1-introduction)
2. [Quick Start (Installation)](#2-quick-start-installation)
3. [First Launch & Onboarding](#3-first-launch--onboarding)
4. [Dashboard: Features Overview](#4-dashboard-features-overview)
    - [Config (Configuration)](#config-configuration)
    - [Monitoring](#monitoring)
    - [Snapshots (Time Machine)](#snapshots-time-machine)
    - [Admin & Settings](#admin--settings)
5. [Professional Tips (Pro Tips)](#5-professional-tips-pro-tips)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Introduction
**Firewalld-GUI** is a modern web interface for managing `firewalld` and `Fail2Ban`. It's designed for those who want full control over server security without needing to remember hundreds of `firewall-cmd` console flags.

---

## 2. Quick Start (Installation)

### System Requirements:
- **OS:** AlmaLinux 9/10, Ubuntu 22.04/24.04.
- **Pre-installed:** `docker`, `docker-compose`, `firewalld`, `fail2ban`.

### Step 1: Create Working Directory
```bash
mkdir firewalld-gui && cd firewalld-gui
mkdir -p data docker
```

### Step 2: Nginx Configuration
Create the `docker/nginx.conf` file:
```nginx
server {
    listen 8080; # Port where the dashboard will be available
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 3: Docker Compose
Create the `docker-compose.yml` file:
```yaml
services:
  firewalld-backend:
    image: webyhomelab/firewalld-gui-backend:latest
    container_name: firewalld-gui-backend
    network_mode: host
    privileged: true
    volumes:
      - ./data:/app/data
      - /etc/firewalld:/etc/firewalld
      - /run/dbus/system_bus_socket:/run/dbus/system_bus_socket
      - /var/run/fail2ban/fail2ban.sock:/var/run/fail2ban/fail2ban.sock
      - /var/log:/var/log:ro
    restart: always

  firewalld-frontend:
    image: webyhomelab/firewalld-gui-frontend:latest
    container_name: firewalld-gui-frontend
    network_mode: host
    restart: always

  firewalld-nginx:
    image: nginx:alpine
    container_name: firewalld-gui-nginx
    network_mode: host
    volumes:
      - ./docker/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - firewalld-backend
      - firewalld-frontend
    restart: always
```

### Step 4: Launch
```bash
docker compose up -d
```
The dashboard will be available at `http://YOUR_SERVER_IP:8080`.

---

## 3. First Launch & Onboarding
Upon first opening, you'll see the **"Welcome to Firewalld-GUI"** form.
1. Enter a username and password for your first account (Superadmin).
2. Click **"Setup Admin Account"**.
3. You will then be automatically redirected to the main dashboard.

---

## 4. Dashboard: Features Overview

### Config (Configuration)
The main workspace.
- **Zones:** Manage zones (public, drop, trusted). You can change the **Target** (default packet behavior: ACCEPT, REJECT, DROP).
- **Policies:** Set up complex filtering rules between zones.
- **Services:** 
    - Create your own (Custom) services.
    - Use smart search across 260+ system services.
- **IP Sets:** Manage IP lists (e.g., whitelist or blacklist).
- **NAT / Port Forwarding:** User-friendly interface for port forwarding.
- **Rich Rules:** Directly add complex rules in firewalld format.

### Monitoring
- **Attack Statistics:** Chart of dropped packets over the last 24 hours.
- **Live Drops:** List of the last 50 blocked connection attempts. Includes **Geo-IP** (country flag).
- **Quick Ban:** One-click ban IP from logs to add it to the blacklist.
- **Fail2Ban:** View active bans from Fail2Ban and instantly unban if needed.

### Snapshots (Time Machine)
Every change made through the panel automatically creates a snapshot of the `/etc/firewalld` configuration.
- If you make a mistake, simply select the desired point in time and click **Restore**. The system will instantly revert to the previous settings and perform a `reload`.

### Admin & Settings
- **Audit Logs:** Who, when, and what action was performed in the panel.
- **User Management:** Create additional administrators.
- **Telegram Alerts:** Set up a bot to receive notifications about anomaly attack spikes or important changes.

---

## 5. Professional Tips (Pro Tips)

### 🛡️ Safe Port Migration
Worried about changing the SSH port and losing access?
1. In the Config tab, click **"🛡️ Safe Migrate"**.
2. Enter the new port. The system will add it alongside the existing one.
3. Verify the connection on the new port.
4. If everything is OK, remove the old port. The system won't let you delete protected ports (22, 80, 443, 8080) until you complete the "Workaround."

### 🔎 Whois Integration
Click on any IP in the monitoring logs to get full information about the ISP, organization, and the exact location of the attacker.

---

## 6. Troubleshooting
- **"Login Failed" immediately after loading:** Check if Nginx is correctly proxying requests to `/api`. Ensure the backend container is running.
- **Fail2Ban not working:** Ensure the `/var/run/fail2ban/fail2ban.sock` socket is correctly mounted in `docker-compose.yml`.
- **Countries (Geo-IP) not displayed:** The backend uses a free API (ip-api.com). Check the server's internet connection.

---
**✦ 2026 Weby Homelab ✦**  
*Made with ❤️ in Kyiv under air raid sirens and blackouts.*
