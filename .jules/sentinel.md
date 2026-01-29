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

## 2025-05-20 - Standardized Password Complexity and Validation Testing
**Vulnerability:** Weak password policies (min 6 chars, no complexity) in registration and creation flows, and missing validation for password reset commands.
**Learning:** Default identity settings often permit weak passwords. When implementing custom complexity via FluentValidation, it's critical to apply it consistently across all flows (Register, Create, Reset). Additionally, testing validators that depend on `IConfiguration` (e.g., for domain allow-lists) requires proper configuration mocking to avoid `NullReferenceException`.
**Prevention:** Always use a minimum of 8 characters with required complexity (upper, lower, digit, special). Centralize or consistently apply these rules. Use `ConfigurationBuilder.AddInMemoryCollection` in validator unit tests to provide necessary configuration sections.

## 2025-05-25 - Partitioned Rate Limiting and Pipeline Precedence
**Vulnerability:** The application used a global fixed-window rate limiter on authentication endpoints, creating a Denial of Service (DoS) risk where one attacker could block all users. Additionally, security headers were applied late in the pipeline, potentially missing error or rate-limit responses.
**Learning:** Global rate limits are often a "quick fix" that introduces availability risks. Partitioning by IP address is necessary for public-facing sensitive endpoints. Furthermore, security headers should be the first thing added to the response to ensure consistent protection across the entire application lifecycle.
**Prevention:** Use `RateLimitPartition` in .NET to isolate limits per client IP. Always place security header middleware at the very top of the `WebApplication` pipeline in `Program.cs`. Enhance CSP with `object-src 'none'`, `base-uri 'self'`, and `form-action 'self'` by default.
