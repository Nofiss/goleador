using System.Reflection;
using System.Text;
using System.Threading.RateLimiting;
using Goleador.Api.Infrastructure;
using Goleador.Api.Services;
using Goleador.Application;
using Goleador.Application.Common.Interfaces;
using Goleador.Infrastructure;
using Goleador.Infrastructure.Hubs;
using Goleador.Infrastructure.Identity;
using Goleador.Infrastructure.Persistence;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using Serilog;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) => configuration.ReadFrom.Configuration(context.Configuration));
builder.WebHost.ConfigureKestrel(options =>
{
    // Defense in Depth: Disable the Server header to avoid revealing server technology and version.
    options.AddServerHeader = false;
});

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    var allowedOrigins =
        builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? ["http://localhost:5173"];

    options.AddPolicy(
        name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    );
});

// Configure Forwarded Headers to support reverse proxies (IIS, Nginx, Docker)
// This ensures that the application can correctly identify the client IP and the original protocol (HTTPS).
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Note: In production, for maximum security, you should restrict KnownIPNetworks and KnownProxies.
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

builder
    .Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        // Account Lockout Settings
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.AllowedForNewUsers = true;

        // Security Hardening: Enforce strict password complexity and unique emails.
        // This provides defense in depth by ensuring these policies are enforced at the identity level.
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            ),
        };

        // Defense in Depth: Enable JWT authentication for SignalR connections.
        // WebSockets don't support custom headers in all browsers, so we extract the token from the query string.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddSignalR();
builder.Services.AddControllers();

// Optimization Bolt ⚡: Add response compression to reduce payload size for data-heavy JSON responses.
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Goleador API", Version = "v1" });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);

    c.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            In = ParameterLocation.Header,
            BearerFormat = "JWT",
            Description = "Inserisci il token JWT nel formato: Bearer {token}",
        }
    );

    c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference("Bearer"), new List<string>() },
    });
});

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    // Partition the rate limit by IP address to prevent a global Denial of Service (DoS) attack.
    // If IP is unavailable, fall back to the Host header.
    options.AddPolicy(
        "AuthPolicy",
        httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: httpContext.Connection.RemoteIpAddress?.ToString()
                    ?? httpContext.Request.Headers.Host.ToString(),
                factory: _ =>
                {
                    var settings = new FixedWindowRateLimiterOptions();
                    builder.Configuration.GetSection("RateLimiting:AuthPolicy").Bind(settings);
                    return settings;
                }
            )
    );
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

builder
    .Services.AddHealthChecks()
    .AddSqlServer(
        connectionString: builder.Configuration.GetConnectionString("DefaultConnection")!,
        healthQuery: "SELECT 1;",
        name: "sqlserver",
        timeout: TimeSpan.FromSeconds(3)
    );

WebApplication app = builder.Build();

// Basic Security Headers - Moved to the top of the pipeline to ensure they are added to all responses,
// including errors and rate-limit rejections.
app.Use(
    async (context, next) =>
    {
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Append("X-Frame-Options", "DENY");
        context.Response.Headers.Append("Referrer-Policy", "no-referrer");

        // Enhanced CSP: added object-src 'none', base-uri 'self', and form-action 'self' for better protection.
        // Also added upgrade-insecure-requests to ensure all content is loaded over HTTPS.
        context.Response.Headers.Append(
            "Content-Security-Policy",
            "default-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;"
        );

        // Modern browsers ignore X-XSS-Protection in favor of CSP. Setting it to 0 is the current recommendation
        // to avoid potential side-channel leaks from the browser's built-in XSS auditor.
        context.Response.Headers.Append("X-XSS-Protection", "0");

        // Restrict browser features to reduce attack surface.
        context.Response.Headers.Append(
            "Permissions-Policy",
            "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
        );

        // Isolate the browsing context to prevent cross-origin information leaks (Spectre/Meltdown mitigation).
        context.Response.Headers.Append("Cross-Origin-Opener-Policy", "same-origin");
        context.Response.Headers.Append("Cross-Origin-Resource-Policy", "same-origin");

        await next();
    }
);

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger(options =>
    {
        options.RouteTemplate = "openapi/{documentName}.json";
    });
    app.MapScalarApiReference(options =>
        options
            .WithTitle("Goleador API")
            .WithTheme(ScalarTheme.BluePlanet)
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient)
            .AddPreferredSecuritySchemes("Bearer")
            .AddHttpAuthentication(
                "Bearer",
                auth =>
                {
                    auth.Token = "";
                }
            )
    );
}

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseForwardedHeaders();
app.UseHttpsRedirection();

// Optimization Bolt ⚡: Use response compression middleware.
app.UseResponseCompression();

app.UseStaticFiles();

app.UseCors(MyAllowSpecificOrigins);

app.UseSerilogRequestLogging();

app.UseRouting();
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<TournamentHub>("/hubs/tournament");

app.MapHealthChecks(
    "/health",
    new HealthCheckOptions { ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse }
);

if (builder.Configuration.GetValue("EfCore:ApplyMigrationsOnStartup", true))
{
    using IServiceScope scope = app.Services.CreateScope();
    ILogger<Program> logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    ApplicationDbContext db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    try
    {
        logger.LogInformation("Applying EF Core migrations on startup.");
        await db.Database.MigrateAsync();
        logger.LogInformation("EF Core migrations applied successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "EF Core migrations failed during startup.");
        throw;
    }
}
else
{
    using IServiceScope scope = app.Services.CreateScope();
    ILogger<Program> logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("EF Core migrations on startup are disabled by configuration.");
}

using (IServiceScope scope = app.Services.CreateScope())
{
    IServiceProvider services = scope.ServiceProvider;
    await DbSeeder.SeedUsersAndRolesAsync(services);
}

// csharpsquid:S6966 - Await RunAsync instead of synchronous Run to ensure asynchronous application startup
await app.RunAsync();
