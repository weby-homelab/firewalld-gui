# Changelog

All notable changes to this project will be documented in this file.

## [1.6.13] - 2026-06-30
### Added
- **Docker HEALTHCHECK** to root Dockerfile for automatic container health monitoring
- **Configurable PORT** via ENV variable in both Dockerfiles (root and backend)
- **`.gitignore`** with comprehensive entries for dependencies, builds, data, logs, and environment files
- **`.geminiignore`** to prevent context pollution in AI agent sessions
- **`.dockerignore`** for cleaner Docker builds
### Changed
- **Dockerfile:** Removed `systemd` package (not needed for uvicorn), reducing image size
- **docker-compose.yml:** Updated image tags to 1.6.13, added healthchecks, removed redundant volume mounts
- **nginx.conf:** Added security headers (`X-Content-Type-Options`, `X-Frame-Options`) and proxy timeout tuning
- **SECURITY.md:** Replaced placeholder version table with actual supported versions and proper vulnerability reporting process
### Fixed
- Synchronized version references between README, VERSION, docker-compose.yml, and package.json

## [1.6.3] - 2026-05-09
### Fixed
- **Security:** Resolved multiple CodeQL vulnerabilities in the backend:
  - **Critical:** Fixed "Uncontrolled command line" (Command Injection) by implementing Regex Match Group Sanitization for all `subprocess` arguments and strictly whitelisting allowed executables.
  - **High:** Fixed "Uncontrolled data used in path expression" (Path Traversal) by adding strict regex sanitization and validation for the `serve_frontend` endpoint.
  - **Medium:** Fixed "Information exposure through an exception" by catching system exceptions safely and returning generic error messages instead of raw stack traces or internal details.
