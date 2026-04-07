# Security Policy / Політика безпеки

## 🛡️ Firewalld-GUI Security Standards

This project provides administrative access to system firewalls and requires high security standards.

1. **Authentication:** Uses JWT tokens with environment-stored `SECRET_KEY`.
2. **No Hardcode:** Telegram notifications and API keys must be configured via `backend/.env`.
3. **Audit Logging:** Every administrative action is logged to `audit_logs` in `stats.db`.

---

## Reporting a Vulnerability

If you find a security bug (e.g., Path Traversal, Auth Bypass):
- **Email:** contact@srvrs.top
- **Telegram:** [REDACTED_TG]

---

## Політика безпеки (UA)

Додаток керує безпекою сервера, тому:
- Всі дії адміністраторів логуються.
- Секрети (JWT Secret, Telegram Token) зберігаються в `.env`.
- При виявленні вразливостей пишіть у приватні канали зв'язку.
