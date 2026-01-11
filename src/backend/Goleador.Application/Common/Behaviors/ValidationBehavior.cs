using FluentValidation;
using FluentValidation.Results;
using MediatR;
using ValidationException = Goleador.Application.Common.Exceptions.ValidationException;

namespace Goleador.Application.Common.Behaviors;

public class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken
    )
    {
        // Se non ci sono validatori per questo comando, prosegui
        if (!validators.Any())
        {
            return await next(cancellationToken);
        }

        var context = new ValidationContext<TRequest>(request);

        // Esegui tutti i validatori in parallelo
        ValidationResult[] validationResults = await Task.WhenAll(
            validators.Select(v => v.ValidateAsync(context, cancellationToken))
        );

        // Raccogli tutti gli errori
        var failures = validationResults
            .Where(r => r.Errors.Count != 0)
            .SelectMany(r => r.Errors)
            .ToList();

        // Se ci sono errori, FERMATI e lancia l'eccezione
        if (failures.Count != 0)
        {
            throw new ValidationException(failures);
        }

        // Se tutto ok, passa la palla al prossimo step (l'Handler)
        return await next(cancellationToken);
    }
}
