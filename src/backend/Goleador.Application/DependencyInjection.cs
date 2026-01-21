using System.Reflection;
using FluentValidation;
using Goleador.Application.Common.Behaviors;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Goleador.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // 1. Registra AutoMapper (scansiona l'assembly corrente)
        services.AddAutoMapper(cfg => { }, Assembly.GetExecutingAssembly());

        // 2. Registra FluentValidation
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // 3. Registra MediatR (CQRS)
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());

            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(CachingBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        });

        return services;
    }
}
