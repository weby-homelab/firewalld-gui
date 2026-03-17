# 🛡️ Firewalld-GUI: Від Нуля до Героя (Zero to Hero)
*Повний посібник із встановлення, налаштування та професійного використання.*

## 📋 Зміст
1. [Вступ](#1-вступ)
2. [Швидкий старт (Встановлення)](#2-швидкий-старт-встановлення)
3. [Перший запуск та Onboarding](#3-перший-запуск-та-onboarding)
4. [Дашборд: Огляд функцій](#4-дашборд-огляд-функцій)
    - [Config (Конфігурація)](#config-конфігурація)
    - [Monitoring (Моніторинг)](#monitoring-моніторинг)
    - [Snapshots (Машина часу)](#snapshots-машина-часу)
    - [Admin та Settings](#admin-та-settings)
5. [Професійні фішки (Pro Tips)](#5-професійні-фішки-pro-tips)
6. [Вирішення проблем](#6-вирішення-проблем)

---

## 1. Вступ
**Firewalld-GUI** — це сучасна веб-панель для керування `firewalld` та `Fail2Ban`. Проект створений для тих, хто хоче мати повний контроль над безпекою сервера без необхідності пам'ятати сотні консольних прапорців `firewall-cmd`.

---

## 2. Швидкий старт (Встановлення)

### Системні вимоги:
- **ОС:** AlmaLinux 9/10, Ubuntu 22.04/24.04.
- **Встановлені:** `docker`, `docker-compose`, `firewalld`, `fail2ban`.

### Крок 1: Створення робочої директорії
```bash
mkdir firewalld-gui && cd firewalld-gui
mkdir -p data docker
```

### Крок 2: Конфігурація Nginx
Створіть файл `docker/nginx.conf`:
```nginx
server {
    listen 8080; # Порт, на якому буде доступна панель
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Крок 3: Docker Compose
Створіть `docker-compose.yml`:
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

### Крок 4: Запуск
```bash
docker compose up -d
```
Панель буде доступна за адресою `http://IP_ВАШОГО_СЕРВЕРА:8080`.

---

## 3. Перший запуск та Onboarding
При першому відкритті ви побачите форму **"Welcome to Firewalld-GUI"**.
1. Введіть логін та пароль для вашого першого аккаунта (Superadmin).
2. Натисніть **"Setup Admin Account"**.
3. Після цього ви автоматично потрапите на основний дашборд.

---

## 4. Дашборд: Огляд функцій

### Config (Конфігурація)
Це основний робочий простір.
- **Zones (Зони):** Керуйте зонами (public, drop, trusted). Ви можете змінювати **Target** (що робити з пакетом за замовчуванням: ACCEPT, REJECT, DROP).
- **Policies (Політики):** Налаштування складних правил фільтрації між зонами.
- **Services (Сервіси):** 
    - Створюйте власні (Custom) сервіси.
    - Використовуйте розумний пошук серед 260+ системних сервісів.
- **IP Sets:** Керування списками IP (наприклад, whitelist або blacklist).
- **NAT / Port Forwarding:** Зручний інтерфейс для прокидання портів.
- **Rich Rules:** Пряме додавання складних правил у форматі firewalld.

### Monitoring (Моніторинг)
- **Attack Statistics:** Графік відхилених пакетів за останні 24 години.
- **Live Drops:** Список останніх 50 спроб підключення, які були заблоковані. Включає **Geo-IP** (прапор країни).
- **Quick Ban:** Одним кліком на IP у логах ви можете додати його до чорного списку.
- **Fail2Ban:** Перегляд активних банів від Fail2Ban та можливість миттєвого розблокування (Unban).

### Snapshots (Машина часу)
Кожна зміна через панель автоматично створює снапшот конфігурації `/etc/firewalld`.
- Якщо ви припустилися помилки, просто виберіть потрібний момент часу і натисніть **Restore**. Система миттєво поверне попередні налаштування та виконає `reload`.

### Admin та Settings
- **Audit Logs:** Хто, коли і яку дію виконав у панелі.
- **User Management:** Створення додаткових адміністраторів.
- **Telegram Alerts:** Налаштуйте бота, щоб отримувати сповіщення про аномальні сплески атак або важливі зміни.

---

## 5. Професійні фішки (Pro Tips)

### 🛡️ Safe Port Migration (Безпечне перенесення порту)
Боїтеся змінити порт SSH і втратити доступ?
1. У вкладці Config натисніть **"🛡️ Safe Migrate"**.
2. Введіть новий порт. Система додасть його паралельно до існуючого.
3. Перевірте підключення по новому порту.
4. Якщо все ОК — видаліть старий порт. Система не дасть видалити захищені порти (22, 80, 443, 8080), поки ви не завершите "Workaround".

### 🔎 Whois Integration
Клікніть на будь-який IP у логах моніторингу, щоб отримати повну інформацію про провайдера, організацію та точну локацію зловмисника.

---

## 6. Вирішення проблем
- **"Login Failed" відразу після завантаження:** Перевірте, чи Nginx правильно проксіює запити на `/api`. Переконайтеся, що бекенд-контейнер запущений.
- **Не працює Fail2Ban:** Переконайтеся, що сокет `/var/run/fail2ban/fail2ban.sock` правильно примонтований у `docker-compose.yml`.
- **Не відображаються країни (Geo-IP):** Бекенд використовує безкоштовний API (ip-api.com). Перевірте наявність інтернет-з'єднання на сервері.

---
**✦ 2026 Weby Homelab ✦**  
*Зроблено з ❤️ у Києві під звуки сирен та блекаутів.*
