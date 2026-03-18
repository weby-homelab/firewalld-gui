<p align="center">
  <a href="INSTRUCTIONS_ENG.md">
    <img src="https://img.shields.io/badge/🇬🇧_English-00D4FF?style=for-the-badge&logo=readme&logoColor=white" alt="English README">
  </a>
  <a href="INSTRUCTIONS.md">
    <img src="https://img.shields.io/badge/🇺🇦_Українська-FF4D00?style=for-the-badge&logo=readme&logoColor=white" alt="Українська версія">
  </a>
</p>

<br>

# 🛡️ Firewalld-GUI: Встановлення на Bare-Metal (Без Docker)
*Детальна інструкція для гілки `classic` (встановлення безпосередньо на ОС).*

## 📋 Зміст
1. [Вступ](#1-вступ)
2. [Встановлення (Bare-Metal)](#2-встановлення-bare-metal)
3. [Перший запуск та Onboarding](#3-перший-запуск-та-onboarding)
4. [Дашборд: Огляд функцій](#4-дашборд-огляд-функцій)
5. [Професійні фішки (Pro Tips)](#5-професійні-фішки-pro-tips)

---

## 1. Вступ
Цей посібник призначений для адміністраторів, які хочуть встановити **Firewalld-GUI** безпосередньо на свою систему (Bare-Metal, LXC, VPS) без використання Docker. Цей метод забезпечує максимальну продуктивність і прямий доступ до системних процесів фаєрволу.

---

## 2. Встановлення (Bare-Metal)

### Крок 1: Встановлення системних залежностей
Для AlmaLinux 9/10:
```bash
dnf install -y python3 python3-pip firewalld fail2ban nginx epel-release
dnf module enable -y nodejs:20
dnf install -y nodejs npm
```

Для Ubuntu 24.04:
```bash
apt update
apt install -y python3 python3-pip python3-venv firewalld fail2ban nginx nodejs npm
```

Увімкніть базові служби:
```bash
systemctl enable --now firewalld fail2ban
```

### Крок 2: Завантаження коду
```bash
git clone -b classic https://github.com/weby-homelab/firewalld-gui.git /opt/firewalld-gui
```

### Крок 3: Збірка Фронтенду (React)
```bash
cd /opt/firewalld-gui/frontend
npm install
npm run build
```
Після успішної збірки оптимізовані файли з'являться у папці `dist/`.

### Крок 4: Налаштування Бекенду (Python)
```bash
cd /opt/firewalld-gui/backend
pip3 install -r requirements.txt
```
*(Для Ubuntu може знадобитися створення venv, якщо система блокує глобальний pip).*

### Крок 5: Налаштування Nginx
Створіть конфігураційний файл `/etc/nginx/conf.d/firewalld-gui.conf` (або у `sites-available` для Ubuntu):
```nginx
server {
    listen 8080;
    root /opt/firewalld-gui/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Крок 6: Створення Systemd Сервісу
Створіть файл `/etc/systemd/system/firewalld-backend.service`:
```ini
[Unit]
Description=Firewalld-GUI Backend
After=network.target firewalld.service fail2ban.service

[Service]
WorkingDirectory=/opt/firewalld-gui/backend
ExecStart=/usr/local/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
User=root
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```
*(Переконайтеся, що шлях до `uvicorn` правильний для вашої системи, наприклад `/usr/bin/uvicorn` або шлях з venv).*

### Крок 7: Запуск та відкриття портів
```bash
systemctl daemon-reload
systemctl enable --now firewalld-backend nginx

# Дозволяємо доступ до порту панелі
firewall-cmd --add-port=8080/tcp --permanent
firewall-cmd --reload
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

- **Config:** Керуйте зонами, політиками, сервісами, IP Sets та Rich Rules.
- **Monitoring:** Графіки атак, список заблокованих IP, інтеграція з Geo-IP.
- **Snapshots:** Кожна зміна конфігурації автоматично створює бекап `/etc/firewalld`. Ви можете відкотитися до будь-якої точки в 1 клік.
- **Admin:** Керування користувачами, Audit Logs та налаштування Telegram Alerts.

---

## 5. Професійні фішки (Pro Tips)
### 🛡️ Safe Port Migration (Безпечне перенесення порту)
Боїтеся змінити порт SSH і втратити доступ?
1. У вкладці Config натисніть **"🛡️ Safe Migrate"**.
2. Введіть новий порт. Система додасть його паралельно до існуючого.
3. Перевірте підключення по новому порту.
4. Якщо все ОК — видаліть старий порт.

---
**✦ 2026 Weby Homelab ✦**
