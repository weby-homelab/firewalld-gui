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
*Сучасне, швидке та естетичне керування мережевою безпекою Linux.*

[![Latest Release](https://img.shields.io/github/v/release/weby-homelab/firewalld-gui)](https://github.com/weby-homelab/firewalld-gui/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![System](https://img.shields.io/badge/system-AlmaLinux_|_Ubuntu_|_RHEL-red.svg)]()

**Firewalld-GUI** — це професійна веб-панель для керування `firewalld` та `Fail2Ban`, створена спеціально для серверів на базі **AlmaLinux 10**, **Ubuntu 24.04** та інших сучасних дистрибутивів. Вона перетворює складні консольні команди на інтуїтивно зрозумілий дашборд із аналітикою в реальному часі.

---

## 🏗 Архітектура системи

```mermaid
graph TD
    User((Адміністратор)) -- HTTPS --> WebUI[Frontend: React + Vite]
    
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

## 🚀 Основні можливості

### 🛠 Керування сервісами (Service Architect)
- **Custom Services**: Створюйте власні описи сервісів, групуючи порти та протоколи.
- **Інформативні картки**: Переглядайте вміст сервісів (порти) прямо у списку без зайвих кліків.
- **Розумний пошук**: Миттєва фільтрація серед 260+ системних дефініцій.
- **Collapsible UI**: Системні сервіси згорнуті за замовчуванням для візуальної чистоти.

### 🧱 Життєвий цикл об'єктів
- **Зони та Політики**: Створення, редагування та видалення об'єктів фаєрвола через браузер.
- **Global Config**: Повний доступ до `firewalld.conf` (Default Zone, Log Denied).
- **Target Actions**: Налаштування стандартної поведінки (ACCEPT, REJECT, DROP) для будь-якої зони.

### 🔍 Threat Intelligence & Аналітика
- **Geo-IP Integration**: Відстежуйте країну походження кожної атаки у реальному часі.
- **Anomaly Detection**: Автоматичні сповіщення в Telegram при виявленні сплесків атак.
- **Fail2Ban Control**: Повний контроль над активними банами та статусом джейлів.
- **Visual Analytics**: Графіки активності відхилених пакетів у реальному часі.

### 🛡 Безпека та Надійність
- **Auto-Snapshots**: Система автоматично робить бекап перед кожною зміною конфігурації.
- **Dual-Channel Execution**: Бекенд об'єднує stdout/stderr для 100% надійності на нових Linux-ядрах.
- **Safe Migration**: Майстер безпечного перенесення SSH-портів.

---

## 📦 Встановлення (Docker Compose)

Для запуску повного стеку (Backend, Frontend, Nginx) використовуйте наступний `docker-compose.yml`:

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

## 📋 Системні вимоги
- **ОС:** AlmaLinux 9/10, Ubuntu 22.04/24.04, RHEL 9+.
- **Залежності:** `firewalld`, `fail2ban`, `docker`.
- **Доступ:** Права `root` (або `privileged` в Docker) для прямої взаємодії з ядром.

---
<p align="center">
  Made with ❤️ in Kyiv under air raid sirens and blackouts<br>
  <strong>✦ 2026 Weby Homelab ✦</strong>
</p>
