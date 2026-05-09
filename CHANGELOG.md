# Changelog

All notable changes to this project will be documented in this file.

## [1.6.3] - 2026-05-09
### Fixed
- **Security:** Resolved multiple CodeQL vulnerabilities in the backend:
  - **Critical:** Fixed "Uncontrolled command line" (Command Injection) by implementing Regex Match Group Sanitization for all `subprocess` arguments and strictly whitelisting allowed executables.
  - **High:** Fixed "Uncontrolled data used in path expression" (Path Traversal) by adding strict regex sanitization and validation for the `serve_frontend` endpoint.
  - **Medium:** Fixed "Information exposure through an exception" by catching system exceptions safely and returning generic error messages instead of raw stack traces or internal details.
