<p align="center">
  <a href="README_ENG.md">
    <img src="https://img.shields.io/badge/🇬🇧_English-00D4FF?style=for-the-badge&logo=readme&logoColor=white" alt="English README">
  </a>
  <a href="README.md">
    <img src="https://img.shields.io/badge/🇺🇦_Українська-FF4D00?style=for-the-badge&logo=readme&logoColor=white" alt="Ukrainian version">
  </a>
</p>

<br>

# 🛡️ Firewalld-GUI (Weby Homelab)
*Modern, Fast, and Aesthetic Linux Network Security Management.*

[![Latest Release](https://img.shields.io/github/v/release/weby-homelab/firewalld-gui)](https://github.com/weby-homelab/firewalld-gui/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![System](https://img.shields.io/badge/system-AlmaLinux_|_Ubuntu_|_RHEL-red.svg)]()

**Firewalld-GUI** is a powerful web interface for managing `firewalld` and `Fail2Ban`, built for system administrators who value their time and want a complete visual picture of server security. It transforms complex console commands into an intuitive dashboard with real-time analytics.

---

## 🧩 System Architecture

```mermaid
graph TD
    User((Administrator)) -->|HTTPS / JWT| UI[Web Dashboard]
    
    subgraph "Firewalld-GUI Backend"
        UI -->|API Requests| FastAPI[FastAPI Service]
        FastAPI -->|Exec| FWCMD[firewall-cmd Engine]
        FastAPI -->|Exec| F2BCMD[fail2ban-client]
        FastAPI -->|Log Parser| LOGS[System Logs]
    end

    subgraph "System Layer"
        FWCMD -->|Manage Zones/Ports| FW[Firewalld Daemon]
        F2BCMD -->|Active Bans| F2B[Fail2Ban Service]
        FW -->|Apply| IPT[nftables / iptables]
    end

    FastAPI -->|Persistence| JSON[(users.json / config.json)]
    FastAPI -->|Stats| DB[(stats.db SQL)]
```

---

## ✨ Key Features

- **🚀 Visual Rule Builder:** Create complex rules, manage ports, and services in one click without the risk of syntax errors.
- **🕵️‍♂️ Fail2Ban Integration:** Full control over active bans. View jail status, attack history, and unban IPs directly from the interface.
- **🕰️ Auto-Snapshots:** The system automatically backs up the current configuration before every change. You can always revert to a stable state.
- **📈 Real-time Analytics:** Track statistics of rejected packets (DROP/REJECT) and attacker activity through integrated charts.
- **🌍 IP Intelligence:** Built-in Whois service allows you to instantly identify the provider and country of origin for any blocked address.

---

## 🛠️ Quick Start

### Using Docker
```bash
git clone https://github.com/weby-homelab/firewalld-gui.git
cd firewalld-gui
docker compose up -d
```
*Note: `--privileged` and `--network host` are required for direct interaction with the firewalld daemon on the host.*

---

## 📋 System Requirements
- **OS:** AlmaLinux 9+, RHEL 9+, Ubuntu 22.04/24.04.
- **Dependencies:** `firewalld`, `fail2ban`, `python3.12+`.
- **Access:** `root` privileges for system command execution.

---
<p align="center">
  Made with ❤️ in Kyiv under air raid sirens and blackouts<br>
  <strong>✦ 2026 Weby Homelab ✦</strong>
</p>
