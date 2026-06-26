<p align="center">
  <a href="README.md">
    <img src="https://img.shields.io/badge/🇬🇧_English-00D4FF?style=for-the-badge&logo=readme&logoColor=white" alt="English README">
  </a>
  <a href="README_UA.md">
    <img src="https://img.shields.io/badge/🇺🇦_Українська-FF4D00?style=for-the-badge&logo=readme&logoColor=white" alt="Українська версія">
  </a>
</p>

<br>

<p align="center">
  <a href="https://github.com/weby-homelab/firewalld-gui/releases/latest">
    <img src="https://img.shields.io/github/v/release/weby-homelab/firewalld-gui?style=flat-square&logo=github&color=blue" alt="Latest Release">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square" alt="License: GPL v3">
  </a>
  <a href="https://github.com/weby-homelab/firewalld-gui/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/weby-homelab/firewalld-gui/docker-image.yml?branch=main&label=docker%20build&logo=docker&style=flat-square" alt="Docker Build Status">
  </a>
  <a href="https://hub.docker.com/r/webyhomelab/firewalld-gui">
    <img src="https://img.shields.io/docker/pulls/webyhomelab/firewalld-gui?style=flat-square&logo=docker" alt="Docker Pulls">
  </a>
  <a href="https://github.com/weby-homelab/firewalld-gui/stargazers">
    <img src="https://img.shields.io/github/stars/weby-homelab/firewalld-gui?style=flat-square&logo=github" alt="GitHub stars">
  </a>
  <a href="https://github.com/weby-homelab/firewalld-gui/issues">
    <img src="https://img.shields.io/github/issues/weby-homelab/firewalld-gui?style=flat-square&logo=github" alt="GitHub issues">
  </a>
</p>

# 🛡️ Firewalld-GUI (Weby Homelab)
*Сучасний, швидкий та естетичний інструмент управління мережевою безпекою для Linux систем.*

**Firewalld-GUI** — це професійна веб-панель керування, розроблена спеціально для адміністрування систем захисту `firewalld` та `Fail2Ban`. Створена на базі сучасного технологічного стеку, вона перетворює складні консольні виклики на інтуїтивно зрозумілу та естетичну панель моніторингу з інтерактивними графіками, аналітикою трафіку та автоматичними сповіщеннями про загрози.

За замовчуванням панель працює на безпечному порту **8649** (міграцію здійснено у червні 2026 року для усунення конфліктів портів хоста та підвищення загальної стабільності деплою).

---

<p align="center">
  <img src="firewalld-gui-1.png" alt="Firewalld-GUI Interface 1" width="800">
  <br><br>
  <img src="firewalld-gui-2.png" alt="Firewalld-GUI Interface 2" width="800">
</p>

---

## 🚀 Основні можливості

*   **⚡ Service Architect (Конструктор сервісів):** Створюйте власні описи сервісів, групуючи порти та протоколи за допомогою зручного редактора. Миттєвий пошук та розумна фільтрація серед більш ніж 260+ системних дефініцій сервісів.
*   **🧱 Життєвий цикл об'єктів:** Повний візуальний контроль над Зонами, Політиками (Policies) та IP-сетами (IPsets). Всі операції супроводжуються діалоговими вікнами підтвердження для захисту від випадкових помилок.
*   **🔒 Безпека та відмовостійкість:**
    *   **Автоматичні знімки (Snapshots):** Перед кожною зміною конфігурації фаєрвола система автоматично створює резервний знімок стану для швидкого повернення (rollback) у разі потреби.
    *   **Safe Port Migration (Безпечна міграція):** Захисні алгоритми запобігають випадковому блокуванню адміністратора на хості під час зміни порту SSH чи інших критичних інтерфейсів.
*   **🔍 Threat Intelligence та Geo-IP:** Трекінг вхідних запитів у реальному часі з автоматичним визначенням країни (Geo-IP) для точної локалізації зловмисників.
*   **🚨 Аномалії та Telegram-сповіщення:** Миттєва відправка сповіщень у ваш Telegram-канал при фіксації пікових навантажень або спроб брутфорсу.
*   **🛡️ Fail2Ban Інтеграція:** Моніторинг активних джейлів (jails), перегляд заблокованих IP та керування банами прямо з веб-інтерфейсу.
*   **✅ Загартована безпека:** Збірка Docker-образу базується на патчі Vite 8.0.16 (захист від вразливостей path traversal та ін'єкції команд).

---

## 🐳 Швидкий запуск (Docker)

Найбільш оптимальним методом розгортання **Firewalld-GUI** є використання офіційного Docker-образу.

### Попередні вимоги
*   Наявність запущеного демона `firewalld` на хост-системі та активний сервіс `dbus`.
*   Встановлені Docker та Docker Compose.

### Варіант 1: Запуск через Docker CLI
Панель потребує використання хост-мережі (`host network mode`) для прямої взаємодії з системним фаєрволом:

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
  -e SECRET_KEY="your_secure_random_jwt_secret" \
  webyhomelab/firewalld-gui:latest
```

### Варіант 2: Запуск через Docker Compose (`docker-compose.yml`)
Створіть конфігураційний файл `docker-compose.yml` та запустіть сервіси:

```yaml
services:
  firewalld-gui:
    image: webyhomelab/firewalld-gui:latest
    container_name: firewalld-gui
    network_mode: host
    privileged: true
    environment:
      - SECRET_KEY=your_secure_random_jwt_secret
    volumes:
      - /etc/firewalld:/etc/firewalld
      - /var/run/dbus:/var/run/dbus
      - /var/run/fail2ban/fail2ban.sock:/var/run/fail2ban/fail2ban.sock
      - /var/log:/var/log:ro
      - ./data:/app/data
    restart: always
```

Після запуску панель буде доступна за адресою: `http://IP_ВАШОГО_СЕРВЕРА:8649`

---

## 🏗️ Архітектура рішення

Проєкт упаковано у високооптимізований образ **All-in-One Docker Image**:

1.  **Frontend (React & TypeScript):** Легкий SPA-додаток, оформлений у фірмовому темно-сірому OLED-стилі з адаптивною сіткою та плавною анімацією.
2.  **Backend (FastAPI & Python):** Асинхронний бекенд, який роздає статичні файли фронтенду, забезпечує авторизацію користувачів, валідацію вводу та фонове логування.
3.  **OS Integration:** Пряма низькорівнева взаємодія з `firewalld` через інтерфейс системної шини DBus для максимальної швидкодії.

---

## ⚖️ Ліцензія

Цей проєкт поширюється на умовах ліцензії **GNU General Public License v3 (GPLv3)**. Детальніше дивіться у файлі [LICENSE](LICENSE).

---

<br>
<p align="center">
  Built in Ukraine under air raid sirens &amp; blackouts ⚡<br>
  &copy; 2026 Weby Homelab
</p>
