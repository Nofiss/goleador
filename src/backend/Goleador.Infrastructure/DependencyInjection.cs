using Goleador.Application.Common.Interfaces;
using Goleador.Infrastructure.Identity;
using Goleador.Infrastructure.Persistence;
using Goleador.Infrastructure.Persistence.Interceptors;
using Goleador.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Goleador.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddMemoryCache();

        services.AddScoped<SoftDeleteInterceptor>();
        services.AddScoped<AuditLogInterceptor>();

        // Configurazione DB (SQL Server)
        // La connection string verrà letta dall'appsettings.json dell'API
        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)
            );

            options.AddInterceptors(
                sp.GetRequiredService<SoftDeleteInterceptor>(),
                sp.GetRequiredService<AuditLogInterceptor>()
            );
        });

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>()
        );

        services.AddTransient<IIdentityService, IdentityService>();
        services.AddTransient<ITournamentNotifier, SignalRTournamentNotifier>();
        services.AddTransient<IFileStorageService, LocalFileStorageService>();

        services.AddScoped<ITeamGeneratorService, OpenAiTeamGeneratorService>();

        services.AddSingleton<IEmailService, GraphEmailService>();

        return services;
    }
}
