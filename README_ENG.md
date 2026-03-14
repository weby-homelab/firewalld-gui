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

**Firewalld-GUI** is a powerful, modern, and secure web dashboard for managing the system firewall `firewalld` and `Fail2Ban` on Linux servers (AlmaLinux, RHEL, CentOS, Ubuntu).

Built for system administrators who want full control over server security through a convenient graphical interface without compromising system reliability.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.12-green.svg)
![React](https://img.shields.io/badge/react-18-61dafb.svg)

---

## ✨ Key Features

- 🌍 **Zones & Ports Management**: Quickly open/close ports and services with a single click.
- 🚦 **Port Forwarding (NAT)**: Easy port forwarding configuration (e.g., from 80 to 8080).
- 📜 **Rich Rules**: Full support for complex Firewalld rules.
- 📦 **IP Sets**: Create and manage IP lists (blacklists and whitelists) for mass blocking.
- 🛡️ **Fail2Ban Integration**: View active bans and unban IPs with one click.
- 📊 **Live Monitoring**: Real-time monitoring of dropped packets and an attack graph for the last 24 hours.
- 🚫 **Quick Ban**: Instantly send an attacking IP to the Blacklist directly from the log table.
- 🔍 **Whois Lookup**: Built-in checker for the attacker's country and ISP.
- 🕰️ **Time Machine (Snapshots)**: Automatic configuration backups before every change and 1-click rollback.
- 👮 **Multi-User & Audit**: Role-based access (Superadmin / Admin) and detailed audit logs (who, when, and what changed).
- 📱 **Responsive Design**: Modern UI (Glassmorphism), fully adapted for mobile devices.
- 🚀 **Telegram Alerts**: Instant notifications about admin actions directly to your Telegram.

---

## 🚀 Installation (Docker)

The project is deployed using Docker Compose. All services (Backend, Frontend, Nginx) are packaged and ready to run.

### Requirements
- OS: AlmaLinux 10 / Ubuntu 24.04 / RHEL
- Installed: `docker`, `docker-compose-plugin`, `firewalld`, `fail2ban`

### Setup
1. Clone the repository:
```bash
git clone https://github.com/weby-homelab/firewalld-gui.git
cd firewalld-gui
```
2. Start the containers:
```bash
docker compose up -d --build
```
3. Open the dashboard in your browser on port `80` (or configure a Cloudflare Tunnel).

### First Login (Smart Onboarding)
Upon the first visit to the panel, the system will prompt you to create the first user (Superadmin). After that, all routes will be securely protected by a JWT token.

---

## 🔒 Security
- **Smart Whitelist**: Create an IP Set named `whitelist` and add your IP address to it. This will protect you from accidental "self-lockouts" both at the GUI level and the `firewalld` kernel level.
- **Protected Ports**: The GUI automatically blocks the deletion of critical ports (22, 55222, 80, 443) to prevent you from losing access to the server.

---

## 📄 License
© 2026 Weby Homelab. All rights reserved. Developed with a passion for security.