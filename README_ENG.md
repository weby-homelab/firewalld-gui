<p align="center">
  <a href="README_ENG.md">
    <img src="https://img.shields.io/badge/🇬🇧_English-00D4FF?style=for-the-badge&logo=readme&logoColor=white" alt="English README">
  </a>
  <a href="README.md">
    <img src="https://img.shields.io/badge/🇺🇦_Українська-FF4D00?style=for-the-badge&logo=readme&logoColor=white" alt="Українська версія">
  </a>
</p>

<br>

# 🛡️ Firewalld-GUI (Bare-Metal Edition)
*Modern, fast, and aesthetic network security management directly on your host.*

[![Latest Release](https://img.shields.io/github/v/release/weby-homelab/firewalld-gui)](https://github.com/weby-homelab/firewalld-gui/releases/latest)
[![Guide](https://img.shields.io/badge/Guide-Zero_to_Hero-brightgreen?style=for-the-badge&logo=bookstack)](INSTRUCTIONS_ENG.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![System](https://img.shields.io/badge/system-AlmaLinux_|_Ubuntu_|_RHEL-red.svg)]()

> **⚠️ Notice:** This branch (`classic`) contains instructions and source code for **direct bare-metal installation**. If you are looking for the Docker version, please switch to the [`main` branch](https://github.com/weby-homelab/firewalld-gui/tree/main).

**Firewalld-GUI** is a professional web panel for managing `firewalld` and `Fail2Ban`. It transforms complex console commands into an intuitive dashboard with real-time analytics. Perfect for LXC containers or dedicated servers where Docker is restricted or unnecessary.

---

<p align="center">
  <img src="firewalld-gui-1.png" alt="Firewalld-GUI Interface 1" width="800">
  <br><br>
  <img src="firewalld-gui-2.png" alt="Firewalld-GUI Interface 2" width="800">
</p>

---

## 📖 Documentation (Zero to Hero)
For those who want to quickly deploy the system and use all its features to 100%, we have prepared a comprehensive guide:
👉 [**Full Setup and Usage Guide (Zero to Hero)**](INSTRUCTIONS_ENG.md)

---

## 🚀 Key Features

### 🛠 Service Management (Service Architect)
- **Custom Services**: Create your own service definitions by grouping ports and protocols.
- **Informative Cards**: View service contents (ports) directly in the list without extra clicks.
- **Smart Search**: Instant filtering among 260+ system definitions.
- **Collapsible UI**: System services are collapsed by default for visual clarity.

### 🧱 Object Lifecycle
- **Zones & Policies**: Create, edit, and delete firewall objects via the browser.
- **Global Config**: Full access to `firewalld.conf` (Default Zone, Log Denied).
- **Target Actions**: Configure default behavior (ACCEPT, REJECT, DROP) for any zone.

### 🔍 Threat Intelligence & Analytics
- **Geo-IP Integration**: Track the origin country of every attack in real time.
- **Anomaly Detection**: Automatic Telegram alerts upon detecting attack spikes.
- **Fail2Ban Control**: Full control over active bans and jail status.
- **Visual Analytics**: Real-time graphs of dropped packet activity.

### 🛡 Security & Reliability
- **Auto-Snapshots**: Automatically backs up the config before every change.
- **Dual-Channel Execution**: Backend merges stdout/stderr for 100% reliability.
- **Safe Migration**: Safe SSH port migration wizard.

---

## 📦 Installation (Brief)

The Bare-Metal version requires **Python 3**, **Node.js (v18+)**, and **Nginx**.

1. Clone the repository: `git clone -b classic https://github.com/weby-homelab/firewalld-gui.git /opt/firewalld-gui`
2. Build the frontend: `cd frontend && npm install && npm run build`
3. Setup the backend: `cd backend && pip3 install -r requirements.txt`
4. Configure Nginx and Systemd services (details in the [Full Guide](INSTRUCTIONS_ENG.md)).

---

## 📋 System Requirements
- **OS:** AlmaLinux 9/10, Ubuntu 22.04/24.04, RHEL 9+.
- **Dependencies:** `python3`, `nodejs`, `npm`, `nginx`, `firewalld`, `fail2ban`.
- **Permissions:** `root` (or `sudo`) access to manage system services.

---

<br>
<p align="center">
  Built in Ukraine under air raid sirens &amp; blackouts ⚡<br>
  &copy; 2026 Weby Homelab
</p>
