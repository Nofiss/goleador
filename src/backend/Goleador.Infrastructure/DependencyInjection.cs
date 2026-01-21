using Goleador.Application.Common.Interfaces;
using Goleador.Infrastructure.Identity;
using Goleador.Infrastructure.Persistence;
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

        // Configurazione DB (SQL Server)
        // La connection string verrà letta dall'appsettings.json dell'API
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)
            )
        );

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>()
        );

        services.AddTransient<IIdentityService, IdentityService>();

        services.AddScoped<ITeamGeneratorService, OpenAiTeamGeneratorService>();

        services.AddSingleton<IEmailService, GraphEmailService>();

        return services;
    }
}
