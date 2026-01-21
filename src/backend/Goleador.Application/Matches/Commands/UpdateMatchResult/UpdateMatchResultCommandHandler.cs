using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Goleador.Application.Matches.Commands.UpdateMatchResult;

public class UpdateMatchResultCommandHandler(IApplicationDbContext context, IMemoryCache cache)
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

        // Aggiorna tavolo (Se passato, altrimenti lascia quello che c'era o null)
        if (request.TableId.HasValue)
        {
            match.AssignTable(request.TableId);
        }

        // 3. Salva
        await context.SaveChangesAsync(cancellationToken);

        // 4. Invalida cache classifica
        if (match.TournamentId.HasValue)
        {
            cache.Remove($"Standings-{match.TournamentId}");
        }

        return Unit.Value;
    }
}
