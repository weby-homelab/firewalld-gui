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

**Firewalld-GUI** — це потужний веб-інтерфейс для керування `firewalld` та `Fail2Ban`, створений для системних адміністраторів, які цінують свій час та хочуть мати повну візуальну картину безпеки сервера. Він перетворює складні консольні команди на інтуїтивно зрозумілий дашборд із аналітикою в реальному часі.

---

## 🧩 Архітектура системи

```mermaid
graph TD
    User((Адміністратор)) -->|HTTPS / JWT| UI[Web Dashboard]
    
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

## ✨ Ключові можливості

- **🚀 Візуальний Rule Builder:** Створюйте складні правила, керуйте портами та сервісами в один клік без ризику синтаксичних помилок.
- **🕵️‍♂️ Fail2Ban Integration:** Повний контроль над активними банами. Переглядайте статус джейлів, історію атак та розбанюйте IP безпосередньо з інтерфейсу.
- **🕰️ Auto-Snapshots:** Система автоматично робить бекап поточної конфігурації перед кожною зміною. Ви завжди можете повернутися до стабільного стану.
- **📈 Real-time Analytics:** Відстежуйте статистику відхилених пакетів (DROP/REJECT) та активність зловмисників через інтегровані графіки.
- **🌍 IP Intelligence:** Вбудований Whois-сервіс дозволяє миттєво ідентифікувати провайдера та країну походження будь-якої заблокованої адреси.

---

## 🛠️ Швидкий старт

### Використання Docker
```bash
git clone https://github.com/weby-homelab/firewalld-gui.git
cd firewalld-gui
docker compose up -d
```
*Важливо: `--privileged` та `--network host` необхідні для прямої взаємодії з демоном firewalld на хості.*

### Встановлення як сервіс
Детальні інструкції для AlmaLinux та Ubuntu доступні в розділі **Installation Guide** в `README_ENG.md`.

---

## 📋 Системні вимоги
- **ОС:** AlmaLinux 9+, RHEL 9+, Ubuntu 22.04/24.04.
- **Залежності:** `firewalld`, `fail2ban`, `python3.12+`.
- **Доступ:** Права `root` для виконання системних команд.

---
<p align="center">
  Made with ❤️ in Kyiv under air raid sirens and blackouts<br>
  <strong>✦ 2026 Weby Homelab ✦</strong>
</p>
