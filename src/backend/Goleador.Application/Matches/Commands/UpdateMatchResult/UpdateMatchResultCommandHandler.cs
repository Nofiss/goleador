using Goleador.Application.Common.Exceptions;
using Goleador.Application.Common.Interfaces;
using Goleador.Application.Matches.Events;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Goleador.Application.Matches.Commands.UpdateMatchResult;

public class UpdateMatchResultCommandHandler(
    IApplicationDbContext context,
    IMemoryCache cache,
    IMediator mediator,
    ICurrentUserService currentUserService,
    ILogger<UpdateMatchResultCommandHandler> logger,
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
            await context.Matches
                .Include(m => m.Participants)
                .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Match), request.Id);

        var wasPlayed = match.Status == MatchStatus.Played;

        // 2. Aggiorna tramite metodo di dominio
        match.SetResult(request.ScoreHome, request.ScoreAway);

        if (request.UsedCards != null)
        {
            match.ClearCards();
            foreach (MatchCardUsageCommandDto cardUsage in request.UsedCards)
            {
                // Validazione: la carta non deve essere stata usata in altre partite dallo stesso team in questo torneo
                var alreadyUsed = await context.MatchCardUsages
                    .AnyAsync(cu => cu.TeamId == cardUsage.TeamId
                                 && cu.CardDefinitionId == cardUsage.CardDefinitionId
                                 && cu.MatchId != match.Id, cancellationToken);

                if (alreadyUsed)
                {
                    throw new InvalidOperationException($"Card {cardUsage.CardDefinitionId} already used by team {cardUsage.TeamId}.");
                }

                match.PlayCard(cardUsage.TeamId, cardUsage.CardDefinitionId);
            }
        }

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

        // 4. Invalida cache classifica e dettaglio torneo
        if (match.TournamentId.HasValue)
        {
            cache.Remove($"Standings-{match.TournamentId}");
            cache.Remove($"TournamentDetail-{match.TournamentId}");
        }

        // Invalida ranking globale (Elo e statistiche cambiano)
        cache.Remove("GlobalRanking");

        // Invalida cache partite recenti (per la home page)
        cache.Remove("RecentMatches");

        // Optimization Bolt ⚡: Invalidate player profile and statistics caches for all participants
        foreach (MatchParticipant participant in match.Participants)
        {
            cache.Remove($"PlayerProfile-{participant.PlayerId}");
            cache.Remove($"PlayerStats-{participant.PlayerId}");
        }

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
