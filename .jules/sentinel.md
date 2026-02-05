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

## 2026-01-28 - Comprehensive Security Header Hardening and Info Redaction
**Vulnerability:** While basic CSP and standard security headers were present, the application lacked modern protections against cross-origin data leaks (Spectre/Meltdown) and browser feature misuse. It also potentially leaked server details via the `Server` header.
**Learning:** Defense in depth requires moving beyond standard headers. Legacy recommendations like `X-XSS-Protection: 1` can actually introduce side-channel vulnerabilities; current standards favor disabling it when a strong CSP is present. Furthermore, Kestrel's default behavior of adding its name to the `Server` header provides unnecessary reconnaissance data to attackers.
**Prevention:** Implement `Cross-Origin-Opener-Policy` and `Cross-Origin-Resource-Policy` to isolate browsing contexts. Set `X-XSS-Protection: 0` when using CSP. Use `Permissions-Policy` to explicitly deny access to unused browser features. Always disable the Server header in Kestrel via `WebHost.ConfigureKestrel`.

## 2026-01-29 - Comprehensive User Status Validation in Auth Flows
**Vulnerability:** The application previously only checked for account lockout during the initial login process, allowing users with active sessions (refresh tokens) to continue renewing their access even after their account was locked or soft-deleted.
**Learning:** Defense in depth requires verifying account status at every significant authentication touchpoint, including token refresh. Relying solely on the initial login check creates a window of vulnerability (up to the refresh token's expiration) where administrative actions like lockout or deletion are not immediately honored.
**Prevention:** Always implement account status checks (`IsLockedOutAsync`, `IsDeleted`) in both `Login` and `RefreshToken` methods. Use explicit security comments to document these checks and ensure they are maintained during future refactors.

## 2026-01-29 - Explicit Soft-Delete Enforcement and Authorization Alignment
**Vulnerability:** Soft-deleted users could potentially authenticate if global filters were bypassed. Additionally, `PlayersController` and `TournamentsController` had restrictive class-level `[Authorize(Roles = "Admin")]` attributes that conflicted with method-level `[Authorize]` attributes intended for regular players.
**Learning:** Defense in depth requires explicit status checks even when global query filters are present, as some ORM methods or direct queries might bypass them. Furthermore, ASP.NET Core authorization attributes are additive; a restrictive class-level attribute will block access even if a method-level attribute is less restrictive (unless it is `[AllowAnonymous]`).
**Prevention:** Always explicitly check `IsDeleted` or similar status flags in authentication and token refresh logic. Use `[Authorize]` at the controller level to ensure baseline security, and then apply specific role requirements (`[Authorize(Roles = "Admin")]`) to administrative methods individually to maintain both functionality and least privilege.

## 2026-01-29 - Account Status Enforcement in Token Refresh Flow
**Vulnerability:** The application enforced account lockout and existence checks during initial login, but the token refresh flow only validated the JWT signature and the hashed refresh token. This allowed locked-out or soft-deleted users with an active refresh token to continue obtaining new access tokens.
**Learning:** Refresh token rotation must be treated as a sensitive authentication event. Validating the "state" of the user account (lockout, active status) at the moment of rotation is critical for real-time access revocation. Relying solely on token validity creates a window where administrative actions (like locking an account) are not immediately effective.
**Prevention:** Always re-verify the current account status (`IsLockedOut`, `IsDeleted`, etc.) against the database in the `RefreshTokenAsync` method before generating new tokens. This ensures that any change in user permission or access is enforced at the next token rotation at the latest.

## 2026-02-05 - Granular Controller Authorization and Broken Access Control
**Vulnerability:** `PlayersController` and `TournamentsController` used class-level `[Authorize(Roles = "Admin")]` attributes, which unintentionally blocked regular authenticated users from accessing endpoints intended for them, such as `GetMyProfile` or `JoinTournament`.
**Learning:** Over-reliance on class-level authorization for controllers with mixed-role access is a common "Broken Access Control" misconfiguration. Attributes in ASP.NET Core are additive, meaning a method-level `[Authorize]` cannot override a class-level role requirement; it only adds to it.
**Prevention:** For controllers serving both public/user and administrative actions, use `[Authorize]` at the class level (or `[AllowAnonymous]` if applicable) and apply specific `[Authorize(Roles = "Admin")]` attributes to the sensitive state-changing methods. Always verify that "regular user" endpoints remain accessible after applying broad security policies.

## 2026-06-10 - Identity Infrastructure Hardening and Auditing Minimization
**Vulnerability:** The application previously lacked explicit account status checks (`IsDeleted`) in password reset and token generation flows, potentially allowing operations on deactivated accounts. Additionally, internal metadata like `ConcurrencyStamp` was being recorded in audit logs, and email addresses in reset links were not properly encoded.
**Learning:** Defense in depth requires consistent application of security policies (like soft-delete checks) across all authentication-related entry points, not just the primary login. Furthermore, auditing should follow the principle of data minimization, excluding internal state markers that provide no audit value but increase noise. Proper URI construction using URL encoding is also critical for both security and robustness.
**Prevention:** Always implement `IsDeleted` checks in all `IdentityService` methods that involve account access or recovery. Maintain a strict list of sensitive/internal properties in `AuditLogInterceptor`. Use `HttpUtility.UrlEncode` for all user-provided data when constructing URLs.

## 2026-06-15 - SignalR Hub Hardening and JWT Authentication
**Vulnerability:** The SignalR `TournamentHub` was accessible to anonymous users and lacked input validation on group joining, allowing anyone to subscribe to real-time updates for any tournament by providing arbitrary strings.
**Learning:** Hubs are often overlooked in standard REST API security reviews. Real-time endpoints require the same level of authorization and input validation as traditional controllers. Specifically, because WebSockets often don't support custom headers, the JWT must be extracted from the query string in the backend and passed via `accessTokenFactory` in the frontend.
**Prevention:** Always apply `[Authorize]` to SignalR hubs that serve sensitive or user-specific data. Validate all hub method parameters (e.g., using `Guid.TryParse`) to prevent joining arbitrary or malformed groups. Ensure JWT middleware is configured to handle `access_token` query parameters for SignalR paths.
