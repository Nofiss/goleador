using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Matches.Commands.UpdateMatchResult;

public class UpdateMatchResultCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateMatchResultCommand, Unit>
{
    public async Task<Unit> Handle(
        UpdateMatchResultCommand request,
        CancellationToken cancellationToken
    )
    {
        // 1. Recupera la partita
        Match match =
            await context.Matches.FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Match with ID {request.Id} not found.");

        // 2. Aggiorna tramite metodo di dominio
        match.SetResult(request.ScoreHome, request.ScoreAway);

        // 3. Salva
        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
