# Firewalld-GUI 🛡️

Сучасна, швидка та потужна веб-панель для керування `firewalld`, розроблена спеціально для серверів на базі **AlmaLinux 10**, **Ubuntu 24.04** та інших сучасних дистрибутивів.

![Version](https://img.shields.io/badge/version-1.4.2-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Linux-lightgrey)

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

## 🚀 Основні можливості

### 🛠 Керування сервісами (Service Architect)
- **Custom Services**: Створюйте власні описи сервісів, групуючи порти та протоколи.
- **Інформативний UI**: Переглядайте порти кастомних сервісів прямо у списку.
- **Розумний пошук**: Миттєва фільтрація серед 260+ системних дефініцій.
- **Collapsible System List**: Системні сервіси згорнуті за замовчуванням для чистоти інтерфейсу.

### 🧱 Життєвий цикл об'єктів
- **Зони та Політики**: Створення та видалення об'єктів фаєрвола прямо з браузера.
- **Global Config**: Керування параметрами `firewalld.conf`, зміна зони за замовчуванням (Default Zone) та налаштування логування (Log Denied).

### 🔍 Розумна аналітика та Безпека
- **Geo-IP Integration**: Відстежуйте країну походження кожної атаки у реальному часі.
- **Anomaly Detection**: Автоматичні сповіщення в Telegram при сплесках активності (DDoS/Brute-force).
- **ICMP Management**: Повне керування блокуванням ICMP-типів з миттєвим застосуванням змін та ультра-помітним дизайном карток.

### 🛡 Безпека та Надійність
- **Safe Mode**: Автоматичне створення знімків (Snapshots) перед кожною зміною.
- **Система відкатів**: Можливість миттєво відновити попередню стабільну конфігурацію.
- **Dual-Channel Execution**: Бекенд об'єднує stdout/stderr для 100% надійності виконання команд на нових ядрах Linux.

## 📦 Встановлення (Full Stack Docker)

Для повноцінної роботи проекту створіть файл `docker-compose.yml`:

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
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - firewalld-backend
      - firewalld-frontend
    restart: always
```

> **Важливо:** Для роботи Nginx вам також знадобиться файл конфігурації `nginx.conf`. Ви можете знайти його в папці `docker/` цього репозиторію.

---
© 2026 **Weby Homelab**
