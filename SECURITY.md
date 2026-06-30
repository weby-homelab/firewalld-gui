# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.6.x   | :white_check_mark: |
| 1.5.x   | :white_check_mark: |
| < 1.5   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability, please report it via GitHub Issues with the `security` label.

- **Response time:** Within 48 hours
- **What to expect:** We will acknowledge your report, investigate the issue, and provide a fix in the next release
- **Coordinate disclosure:** We prefer coordinated disclosure — please allow us time to patch before public disclosure
- **Safe harbor:** We will not take legal action against security researchers who follow this policy

## Security Best Practices for Deployers

- Never commit `.env` files or `data/` directory to version control
- Use a strong `SECRET_KEY` (minimum 32 characters, random)
- Run behind a reverse proxy (nginx/Caddy) with TLS
- Keep the Docker image updated to the latest version
- Restrict network access to trusted IPs when possible
