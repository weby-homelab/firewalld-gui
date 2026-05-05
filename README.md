# 🛡️ Firewalld-GUI (Weby Homelab)

[![Latest Release](https://img.shields.io/github/v/release/weby-homelab/firewalld-gui)](https://github.com/weby-homelab/firewalld-gui/releases/latest)
[![License](https://img.shields.io/github/license/weby-homelab/firewalld-gui)](LICENSE)

**Firewalld-GUI** — це потужна та сучасна веб-панель для управління `firewalld`. Проєкт створений для системних адміністраторів, які хочуть мати повний візуальний контроль над безпекою сервера без необхідності пам'ятати сотні команд `firewall-cmd`.

---

<p align="center">
  <img src="frontend/src/assets/hero.png" alt="Firewalld-GUI Dashboard" width="800">
</p>

---

## 🐳 Швидкий запуск (Docker)

Найпростіший спосіб запустити **Firewalld-GUI** — використовувати офіційний Docker-образ:

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

Або через **docker-compose.yml**:

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

Панель буде доступна на порті **8080**.

---

## 🚀 Основні можливості

### 🛠 Керування сервісами
- **Custom Services**: Створюйте власні сервіси, групуючи порти та протоколи.
- **Інформативні картки**: Переглядайте порти прямо у списку.
- **Розумний пошук**: Миттєва фільтрація серед 260+ системних дефініцій.

### 🧱 Життєвий цикл об'єктів
- **Зони та Політики**: Повний цикл управління (створення/редагування/видалення).
- **Global Config**: Доступ до `firewalld.conf` (Default Zone, Log Denied).
- **Target Actions**: Налаштування поведінки (ACCEPT, REJECT, DROP).

### 🔍 Threat Intelligence
- **Geo-IP Integration**: Відстежуйте країну кожної атаки.
- **Anomaly Detection**: Сповіщення в Telegram при сплесках атак.
- **Fail2Ban Control**: Управління банами та статусом джейлів.

---

## 🏗️ Архітектура рішення

Проєкт побудований як **All-in-One Docker Image**:

1.  **Frontend (React):** Швидкий SPA-інтерфейс, вбудований у бекенд.
2.  **Backend (FastAPI):** Асинхронний API, який обслуговує запити та роздає статику.
3.  **OS Integration:** Пряма взаємодія з `firewalld` через DBus.

---

<br>
<p align="center">
  Built in Ukraine under air raid sirens &amp; blackouts ⚡<br>
  &copy; 2026 Weby Homelab
</p>
