using Goleador.Application.Common.Exceptions;
using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Goleador.Application.Matches.Events;
using Goleador.Domain.Enums;

namespace Goleador.Application.Matches.Commands.UpdateMatchResult;

public class UpdateMatchResultCommandHandler(
    IApplicationDbContext context,
    IMemoryCache cache,
    IMediator mediator,
    ICurrentUserService currentUserService,
    ILogger<UpdateMatchResultCommandHandler> logger
    ITournamentNotifier tournamentNotifier
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
            ?? throw new NotFoundException(nameof(Match), request.Id);

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

        logger.LogInformation(
            "User {UserId} updated match {MatchId} result to {ScoreHome}-{ScoreAway}",
            currentUserService.UserId,
            match.Id,
            match.ScoreHome,
            match.ScoreAway
        );
        
        // 6. Notifica Real-Time tramite SignalR
        if (match.TournamentId.HasValue)
        {
            await tournamentNotifier.NotifyMatchUpdated(match.TournamentId.Value, match.Id);
        }

        return Unit.Value;
    }
}
