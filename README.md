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
*Сучасне, швидке та естетичне керування мережевою безпекою Linux безпосередньо на вашому хості.*

[![Latest Release](https://img.shields.io/github/v/release/weby-homelab/firewalld-gui)](https://github.com/weby-homelab/firewalld-gui/releases/latest)
[![Guide](https://img.shields.io/badge/Guide-Zero_to_Hero-brightgreen?style=for-the-badge&logo=bookstack)](INSTRUCTIONS.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![System](https://img.shields.io/badge/system-AlmaLinux_|_Ubuntu_|_RHEL-red.svg)]()

> **⚠️ Зверніть увагу:** Ця гілка (`classic`) містить інструкції та файли для **прямого встановлення на сервер (Bare-Metal)**. Якщо ви шукаєте версію для Docker, будь ласка, перейдіть до гілки [`main`](https://github.com/weby-homelab/firewalld-gui/tree/main).

**Firewalld-GUI** — це професійна веб-панель для керування `firewalld` та `Fail2Ban`. Вона перетворює складні консольні команди на інтуїтивно зрозумілий дашборд із аналітикою в реальному часі. Ідеально підходить для LXC-контейнерів або виділених серверів, де використання Docker є небажаним або неможливим.

---

<p align="center">
  <img src="frontend/src/assets/hero.png" alt="Firewalld-GUI Dashboard" width="800">
</p>

---

## 📖 Документація (Від Нуля до Героя)
Для тих, хто хоче швидко розгорнути систему та використовувати всі її можливості на 100%, ми підготували вичерпний посібник:
👉 [**Повна інструкція з налаштування та використання (Zero to Hero)**](INSTRUCTIONS.md)

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
- **Target Actions**: Налаштування стандартної поведінки (ACCEPT, REJECT, DROP) for any zone.

### 🔍 Threat Intelligence & Аналітика
- **Geo-IP Integration**: Відстежуйте країну походження кожної атаки у реальному часі.
- **Anomaly Detection**: Автоматичні сповіщення в Telegram при виявленні сплесків атак.
- **Fail2Ban Control**: Повний контроль над активними банами та статусом джейлів.
- **Visual Analytics**: Графіки активності відхилених пакетів у реальному часі.

### 🛡 Безпека та Надійність
- **Auto-Snapshots**: Система автоматично робить бекап перед кожною зміною конфігурації.
- **Dual-Channel Execution**: Бекенд об'єднує stdout/stderr для 100% надійності.
- **Safe Migration**: Майстер безпечного перенесення SSH-портів.

---

## 📦 Встановлення (Коротко)

Встановлення Bare-Metal версії вимагає наявності **Python 3**, **Node.js (v18+)**, та **Nginx**.

1. Клонуйте репозиторій: `git clone -b classic https://github.com/weby-homelab/firewalld-gui.git /opt/firewalld-gui`
2. Зберіть фронтенд: `cd frontend && npm install && npm run build`
3. Налаштуйте бекенд: `cd backend && pip3 install -r requirements.txt`
4. Налаштуйте Nginx та Systemd-сервіси (деталі у [Повній інструкції](INSTRUCTIONS.md)).

---

## 📋 Системні вимоги
- **ОС:** AlmaLinux 9/10, Ubuntu 22.04/24.04, RHEL 9+.
- **Залежності:** `python3`, `nodejs`, `npm`, `nginx`, `firewalld`, `fail2ban`.
- **Доступ:** Права `root` (або `sudo`) для керування системними службами.

---

<br>
<p align="center">
  Built in Ukraine under air raid sirens &amp; blackouts ⚡<br>
  &copy; 2026 Weby Homelab
</p>
