# Sentinel Journal - Security Learnings

## 2025-05-15 - Hardcoded Secrets in Infrastructure
**Vulnerability:** Hardcoded database passwords and JWT secret keys were found in both `appsettings.json` and `docker-compose.prod.yml`.
**Learning:** The project used a "convention-over-security" approach where default credentials were provided for easier setup, but these would leak into production if not explicitly overridden. The .NET environment variable mapping (using `__` for nesting) was utilized to move these to a secure configuration.
**Prevention:** Always use environment variable interpolation in `docker-compose` files and maintain a `.env.example` file for production deployment. Use `appsettings.Development.json` for local-only development secrets to keep them out of the main configuration.
