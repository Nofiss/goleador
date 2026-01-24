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
        // Partiamo dai partecipanti dei match terminati
        var playerStats = await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played)
            .SelectMany(m => m.Participants)
            .GroupBy(mp => mp.PlayerId)
            .Select(g => new
            {
                PlayerId = g.Key,
                TotalMatches = g.Count(),
                Wins = g.Count(mp =>
                    (mp.Side == Side.Home && mp.Match.ScoreHome > mp.Match.ScoreAway) ||
                    (mp.Side == Side.Away && mp.Match.ScoreAway > mp.Match.ScoreHome)
                )
            })
            .ToDictionaryAsync(x => x.PlayerId, x => x, cancellationToken);

        // 2. Recupera tutti i giocatori ordinati per ELO
        var players = await context.Players
            .AsNoTracking()
            .OrderByDescending(p => p.EloRating)
            .ToListAsync(cancellationToken);

        // 3. Mappa i risultati
        return players.Select(p => {
            playerStats.TryGetValue(p.Id, out var stats);
            int total = stats?.TotalMatches ?? 0;
            int wins = stats?.Wins ?? 0;

            return new PlayerRankingDto
            {
                Id = p.Id,
                Nickname = p.Nickname,
                EloRating = p.EloRating,
                TotalMatches = total,
                WinRate = total == 0 ? 0 : Math.Round((double)wins / total * 100, 1)
            };
        }).ToList();
    }
}
