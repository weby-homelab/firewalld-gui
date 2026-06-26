<p align="center">
  <a href="README.md">
    <img src="https://img.shields.io/badge/🇬🇧_English-00D4FF?style=for-the-badge&logo=readme&logoColor=white" alt="English README">
  </a>
  <a href="README_UA.md">
    <img src="https://img.shields.io/badge/🇺🇦_Українська-FF4D00?style=for-the-badge&logo=readme&logoColor=white" alt="Українська версія">
  </a>
</p>

<br>

<p align="center">
  <a href="https://github.com/weby-homelab/firewalld-gui/releases/latest">
    <img src="https://img.shields.io/github/v/release/weby-homelab/firewalld-gui?style=flat-square&logo=github&color=blue" alt="Latest Release">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square" alt="License: GPL v3">
  </a>
  <a href="https://github.com/weby-homelab/firewalld-gui/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/weby-homelab/firewalld-gui/docker-image.yml?branch=main&label=docker%20build&logo=docker&style=flat-square" alt="Docker Build Status">
  </a>
  <a href="https://hub.docker.com/r/webyhomelab/firewalld-gui">
    <img src="https://img.shields.io/docker/pulls/webyhomelab/firewalld-gui?style=flat-square&logo=docker" alt="Docker Pulls">
  </a>
  <a href="https://github.com/weby-homelab/firewalld-gui/stargazers">
    <img src="https://img.shields.io/github/stars/weby-homelab/firewalld-gui?style=flat-square&logo=github" alt="GitHub stars">
  </a>
  <a href="https://github.com/weby-homelab/firewalld-gui/issues">
    <img src="https://img.shields.io/github/issues/weby-homelab/firewalld-gui?style=flat-square&logo=github" alt="GitHub issues">
  </a>
</p>

# 🛡️ Firewalld-GUI (Docker edition)
*Modern, fast, and aesthetic network security management for Linux systems.*

**Firewalld-GUI** is a professional, web-based control panel designed specifically for managing `firewalld` and `Fail2Ban` security systems. Built with modern technologies, it translates complex command-line actions into an intuitive, rich dashboard with real-time logging, traffic analysis, and proactive threat alerts. 

By default, the dashboard is served securely on port **8649** (migrated in June 2026 to prevent host port conflicts and enhance overall system stability).

---

<p align="center">
  <img src="firewalld-gui-1.png" alt="Firewalld-GUI Interface 1" width="800">
  <br><br>
  <img src="firewalld-gui-2.png" alt="Firewalld-GUI Interface 2" width="800">
</p>

---

## 🚀 Key Features

*   **⚡ Service Architect:** Define custom services by grouping ports and protocols with a smart editor. Immediately search through 260+ system-defined services with instant reactive filtering.
*   **🧱 Complete Object Lifecycle:** Manage Zones, Policies, and IPsets visually. Easily view, create, edit, or delete items with robust confirmation dialogs to prevent mistakes.
*   **🔒 Safety & Resiliency First:** 
    *   **Automated Snapshots:** System automatically captures configuration snapshots before applying any changes, allowing one-click rollbacks if needed.
    *   **Safe Port Migration:** Built-in safeguards prevent administrators from locking themselves out of the host when changing SSH or critical access ports.
*   **🔍 Threat Intelligence & Geo-IP:** Live traffic tracking with integrated Geo-IP lookups to identify and map the origin of incoming requests.
*   **🚨 Anomaly Detection & Alerts:** Instantly send alerts directly to your Telegram channel when abnormal traffic spikes or brute-force actions are detected.
*   **🛡️ Fail2Ban Integration:** Control jail status, monitor banned IPs, and ban/unban malicious hosts directly from the UI.
*   **✅ Enterprise Security Hardening:** Hardened Docker build with Vite 8.0.16 security patches (securing path traversal and command injection risks).

---

## 🐳 Quick Start (Docker)

The recommended way to deploy **Firewalld-GUI** is using the official Docker image. 

### Prerequisites
*   Host OS must run `firewalld` and have the `dbus` system service active.
*   Docker & Docker Compose installed.

### Option 1: Docker Run
Run the container using host network mode to allow direct communication with the host's firewall daemon:

```bash
docker run -d \
  --name firewalld-gui \
  --network host \
  --privileged \
  -v /etc/firewalld:/etc/firewalld \
  -v /var/run/dbus:/var/run/dbus \
  -v /var/run/fail2ban/fail2ban.sock:/var/run/fail2ban/fail2ban.sock \
  -v /var/log:/var/log:ro \
  -v ./data:/app/data \
  -e SECRET_KEY="your_secure_random_jwt_secret" \
  webyhomelab/firewalld-gui:latest
```

### Option 2: Docker Compose (`docker-compose.yml`)
Create a `docker-compose.yml` file and start the services:

```yaml
services:
  firewalld-gui:
    image: webyhomelab/firewalld-gui:latest
    container_name: firewalld-gui
    network_mode: host
    privileged: true
    environment:
      - SECRET_KEY=your_secure_random_jwt_secret
    volumes:
      - /etc/firewalld:/etc/firewalld
      - /var/run/dbus:/var/run/dbus
      - /var/run/fail2ban/fail2ban.sock:/var/run/fail2ban/fail2ban.sock
      - /var/log:/var/log:ro
      - ./data:/app/data
    restart: always
```

Once started, the panel will be accessible at: `http://YOUR_SERVER_IP:8649`

---

## 🏗️ Architecture

The solution is packaged as an optimized **All-in-One Docker Image**:

1.  **Frontend (React & TypeScript):** Modern SPA styled with custom near-black palettes, near-zero horizontal scrolling design, and smooth transitions.
2.  **Backend (FastAPI & Python):** Asynchronous API that serves the React build statically, manages authentication/onboarding, performs command validation, and manages background tasks.
3.  **OS Integration:** Communicates directly with `firewalld` using DBus, allowing real-time, persistent configuration updates.

---

## ⚖️ License

This project is licensed under the terms of the **GNU General Public License v3 (GPLv3)**. See the [LICENSE](LICENSE) file for details.

---

<br>
<p align="center">
  Built in Ukraine under air raid sirens &amp; blackouts ⚡<br>
  &copy; 2026 Weby Homelab
</p>
