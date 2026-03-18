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
[![Guide](https://img.shields.io/badge/Guide-Zero_to_Hero-brightgreen?style=for-the-badge&logo=bookstack)](INSTRUCTIONS_ENG.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![System](https://img.shields.io/badge/system-AlmaLinux_|_Ubuntu_|_RHEL-red.svg)]()

**Firewalld-GUI** is a professional web-based control panel for managing `firewalld` and `Fail2Ban`, specifically built for servers running **AlmaLinux 10**, **Ubuntu 24.04**, and other modern distributions. It transforms complex CLI commands into an intuitive dashboard with real-time analytics.

![Dashboard Screenshot 1](firewalld-gui-1.png)
![Dashboard Screenshot 2](firewalld-gui-2.png)

---

## 📖 Documentation (Zero to Hero)
For those who want to quickly deploy the system and use all its features to the fullest, we've prepared a comprehensive guide:
👉 [**Full setup and usage guide (Zero to Hero)**](INSTRUCTIONS_ENG.md)

---

## 🏗 System Architecture

```mermaid
graph TD
    User((Administrator)) -- HTTPS --> WebUI[Frontend: React + Vite]
    
    subgraph "Docker Container"
        WebUI -- API Calls --> FastApi[Backend: FastAPI]
        FastApi -- Execution --> Cmd[Shell: firewall-cmd]
        FastApi -- Logging --> Logs[(SQLite Stats / Audit)]
        FastApi -- Alerts --> TG[Telegram Bot]
    end
    
    subgraph "Host OS (AlmaLinux/Ubuntu)"
        Cmd -- Permanent Config --> FW[Firewalld Service]
        FW -- Network Rules --> Nft[Nftables / Iptables]
        SysLogs[/var/log/syslog/] -- Streaming --> FastApi
    end
    
    style User fill:#f9f,stroke:#333,stroke-width:2px
    style Docker fill:#f5f5f5,stroke:#6366f1,stroke-width:2px,stroke-dasharray: 5 5
    style FW fill:#ff9900,stroke:#333,stroke-width:2px
```

---

## 🚀 Key Features

### 🛠 Service Management (Service Architect)
- **Custom Services**: Create your own service definitions by grouping ports and protocols.
- **Informative Cards**: View service contents (ports) directly in the list without extra clicks.
- **Smart Search**: Instantly filter through 260+ system service definitions.
- **Collapsible UI**: System services are collapsed by default for visual clarity.

### 🧱 Object Lifecycle
- **Zones & Policies**: Create, edit, and delete firewall objects via browser.
- **Global Config**: Full access to `firewalld.conf` (Default Zone, Log Denied).
- **Target Actions**: Configure default behavior (ACCEPT, REJECT, DROP) for any zone.

### 🔍 Threat Intelligence & Analytics
- **Geo-IP Integration**: Track the origin country of every attack in real-time.
- **Anomaly Detection**: Automatic Telegram alerts for traffic spikes.
- **Fail2Ban Control**: Full control over active bans and jail status.
- **Visual Analytics**: Real-time activity charts for dropped packets.

### 🛡 Safety & Reliability
- **Auto-Snapshots**: System automatically backs up configuration before any change.
- **Dual-Channel Execution**: Backend merges stdout/stderr for 100% reliability on new Linux kernels.
- **Safe Migration**: Guided wizard for secure SSH port migration.

---

## 📦 Installation (Docker Compose)

To run the full stack (Backend, Frontend, Nginx), use the following `docker-compose.yml`:

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

---

## 📋 System Requirements
- **OS:** AlmaLinux 9/10, Ubuntu 22.04/24.04, RHEL 9+.
- **Dependencies:** `firewalld`, `fail2ban`, `docker`.
- **Access:** `root` privileges (or `privileged` in Docker) for kernel interaction.

---
<p align="center">
  Made with ❤️ in Kyiv under air raid sirens and blackouts<br>
  <strong>✦ 2026 Weby Homelab ✦</strong>
</p>
