# Sentinel Journal - Security Learnings

## 2025-05-15 - Hardcoded Secrets in Infrastructure
**Vulnerability:** Hardcoded database passwords and JWT secret keys were found in both `appsettings.json` and `docker-compose.prod.yml`.
**Learning:** The project used a "convention-over-security" approach where default credentials were provided for easier setup, but these would leak into production if not explicitly overridden. The .NET environment variable mapping (using `__` for nesting) was utilized to move these to a secure configuration.
**Prevention:** Always use environment variable interpolation in `docker-compose` files and maintain a `.env.example` file for production deployment. Use `appsettings.Development.json` for local-only development secrets to keep them out of the main configuration.

## 2025-05-16 - Externalizing Seed Credentials and Client URLs
**Vulnerability:** Seeded user passwords (Admin/Referee) were hardcoded in `DbSeeder.cs`, and the client application URL for password reset links was hardcoded to `localhost` in `ForgotPasswordCommandHandler.cs`.
**Learning:** Hardcoding credentials in seeding logic is a common oversight that leads to "default" accounts with known passwords in production. Similarly, hardcoding URLs for external communication (like emails) breaks environment portability.
**Prevention:** Inject `IConfiguration` into seeder classes and command handlers. Use clear configuration keys like `Seed:AdminPassword` and `App:ClientUrl`. Provide safe defaults for development while ensuring these can be overridden via environment variables in production.

## 2025-05-17 - API Hardening and Standardized JWT Claims
**Vulnerability:** The API lacked basic security headers (CSP, X-Frame-Options, etc.), exposed documentation in production, and issued JWTs with local time and missing standard subject claims.
**Learning:** Security by default is often missing in boilerplate. Missing headers like `nosniff` or `DENY` (X-Frame-Options) leave the app vulnerable to basic web attacks. Furthermore, using `DateTime.Now` for JWT expiration is a common bug as the spec requires UTC, leading to authentication failures across time zones.
**Prevention:** Implement a standard "Security Hardening" middleware in `Program.cs` that sets secure defaults for all responses. Ensure JWT generation always includes `ClaimTypes.NameIdentifier` for consistent user identification and uses `DateTime.UtcNow`.
