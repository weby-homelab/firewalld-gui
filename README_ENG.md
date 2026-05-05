<p align="center">
  <a href="README_ENG.md">
    <img src="https://img.shields.io/badge/🇬🇧_English-00D4FF?style=for-the-badge&logo=readme&logoColor=white" alt="English README">
  </a>
  <a href="README.md">
    <img src="https://img.shields.io/badge/🇺🇦_Українська-FF4D00?style=for-the-badge&logo=readme&logoColor=white" alt="Українська версія">
  </a>
</p>

<br>

# 🛡️ Firewalld-GUI (Weby Homelab)
*Modern, fast, and aesthetic network security management for Linux.*

[![Latest Release](https://img.shields.io/github/v/release/weby-homelab/firewalld-gui)](https://github.com/weby-homelab/firewalld-gui/releases/latest)
[![License](https://img.shields.io/github/license/weby-homelab/firewalld-gui)](LICENSE)

**Firewalld-GUI** is a professional web-based control panel for managing `firewalld` and `Fail2Ban`. It transforms complex CLI commands into an intuitive dashboard with real-time analytics.

---

<p align="center">
  <img src="frontend/src/assets/hero.png" alt="Firewalld-GUI Dashboard" width="800">
</p>

---

## 🐳 Quick Start (Docker)

The fastest way to run **Firewalld-GUI** is using the official Docker image:

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
  webyhomelab/firewalld-gui:latest
```

Or via **docker-compose.yml**:

```yaml
services:
  firewalld-gui:
    image: webyhomelab/firewalld-gui:latest
    container_name: firewalld-gui
    network_mode: host
    privileged: true
    volumes:
      - /etc/firewalld:/etc/firewalld
      - /var/run/dbus:/var/run/dbus
      - /var/run/fail2ban/fail2ban.sock:/var/run/fail2ban/fail2ban.sock
      - /var/log:/var/log:ro
      - ./data:/app/data
    restart: always
```

The panel will be available on port **8080**.

---

## 🚀 Key Features

*   **Service Architect:** Create custom service definitions by grouping ports and protocols.
*   **Object Lifecycle:** Manage Zones, Policies, and IPsets via a modern UI.
*   **Threat Intelligence:** Geo-IP integration to track attack origins in real-time.
*   **Anomaly Detection:** Automatic Telegram alerts for traffic spikes.
*   **Safety First:** Automatic snapshots created before every configuration change.

---

## 🏗️ Architecture

The project is built as an **All-in-One Docker Image**:

1.  **Frontend (React):** Responsive SPA interface built and embedded into the backend.
2.  **Backend (FastAPI):** Asynchronous API serving requests and static frontend files.
3.  **OS Integration:** Direct interaction with `firewalld` via DBus.

---

<br>
<p align="center">
  Built in Ukraine under air raid sirens &amp; blackouts ⚡<br>
  &copy; 2026 Weby Homelab
</p>
