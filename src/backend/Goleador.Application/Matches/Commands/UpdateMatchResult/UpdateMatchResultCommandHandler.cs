using Goleador.Application.Common.Exceptions;
using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

using Goleador.Application.Matches.Events;
using Goleador.Domain.Enums;

namespace Goleador.Application.Matches.Commands.UpdateMatchResult;

public class UpdateMatchResultCommandHandler(
    IApplicationDbContext context,
    IMemoryCache cache,
    IMediator mediator
) : IRequestHandler<UpdateMatchResultCommand, Unit>
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

        var wasPlayed = match.Status == MatchStatus.Played;

        // 2. Aggiorna tramite metodo di dominio
        match.SetResult(request.ScoreHome, request.ScoreAway);

        // Impostiamo il valore originale per il controllo di concorrenza
        context.Entry(match).Property(x => x.RowVersion).OriginalValue = Convert.FromBase64String(
            request.RowVersion
        );

        // Aggiorna tavolo (Se passato, altrimenti lascia quello che c'era o null)
        if (request.TableId.HasValue)
        {
            match.AssignTable(request.TableId);
        }

        // 3. Salva
        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            throw new ConcurrencyException(
                "La partita è stata modificata da un altro utente.",
                ex
            );
        }

        // 4. Invalida cache classifica
        if (match.TournamentId.HasValue)
        {
            cache.Remove($"Standings-{match.TournamentId}");
        }

        // Invalida ranking globale (Elo e statistiche cambiano)
        cache.Remove("GlobalRanking");

        // 5. Trigger ELO se la partita è stata appena conclusa
        if (!wasPlayed && match.Status == MatchStatus.Played)
        {
            await mediator.Publish(new MatchFinishedEvent(match.Id), cancellationToken);
        }

        return Unit.Value;
    }
}
