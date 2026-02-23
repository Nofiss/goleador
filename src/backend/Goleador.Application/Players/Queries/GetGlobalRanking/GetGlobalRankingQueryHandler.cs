using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Players.Queries.GetGlobalRanking;

public class GetGlobalRankingQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetGlobalRankingQuery, List<PlayerRankingDto>>
{
    public async Task<List<PlayerRankingDto>> Handle(
        GetGlobalRankingQuery request,
        CancellationToken cancellationToken
    )
    {
        // 1. Recupera statistiche aggregate per tutti i giocatori
        // Partiamo dai partecipanti dei match terminati.
        // Ottimizzazione Bolt ⚡: Proiettiamo solo i campi necessari (IDs, Side, Scores) PRIMA del raggruppamento.
        // Questo riduce il traffico dati e semplifica il lavoro del database (O(1) transfer).
        var playerStats = await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played)
            .SelectMany(m => m.Participants.Select(p => new { p.PlayerId, p.Side, m.ScoreHome, m.ScoreAway }))
            .GroupBy(x => x.PlayerId)
            .Select(g => new
            {
                PlayerId = g.Key,
                TotalMatches = g.Count(),
                Wins = g.Count(x =>
                    (x.Side == Side.Home && x.ScoreHome > x.ScoreAway) ||
                    (x.Side == Side.Away && x.ScoreAway > x.ScoreHome)
                )
            })
            .ToDictionaryAsync(x => x.PlayerId, x => x, cancellationToken);

        // 2. Recupera tutti i giocatori ordinati per ELO
        // Ottimizzazione Bolt ⚡: Usiamo una proiezione per caricare solo i campi necessari (Id, Nickname, EloRating).
        // Evitiamo di caricare intere entità Player (FirstName, LastName, Email, etc.), riducendo drasticamente l'uso di memoria (O(1) transfer).
        var players = await context.Players
            .AsNoTracking()
            .OrderByDescending(p => p.EloRating)
            .Select(p => new { p.Id, p.Nickname, p.EloRating })
            .ToListAsync(cancellationToken);

        // 3. Mappa i risultati
        // Poiché abbiamo già aggregato le statistiche in un dizionario O(1), il mapping finale è estremamente veloce.
        return [.. players.Select(p =>
        {
            playerStats.TryGetValue(p.Id, out var stats);
            var total = stats?.TotalMatches ?? 0;
            var wins = stats?.Wins ?? 0;

            return new PlayerRankingDto
            {
                Id = p.Id,
                Nickname = p.Nickname,
                EloRating = p.EloRating,
                TotalMatches = total,
                WinRate = total == 0 ? 0 : Math.Round((double)wins / total * 100, 1)
            };
        })];
    }
}
