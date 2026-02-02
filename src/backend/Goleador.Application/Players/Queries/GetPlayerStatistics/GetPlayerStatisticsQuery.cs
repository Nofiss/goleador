using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Players.Queries.GetPlayerStatistics;

public record GetPlayerStatisticsQuery(Guid PlayerId) : IRequest<PlayerStatisticsDto>;

public class GetPlayerStatisticsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetPlayerStatisticsQuery, PlayerStatisticsDto>
{
    public async Task<PlayerStatisticsDto> Handle(
        GetPlayerStatisticsQuery request,
        CancellationToken cancellationToken
    )
    {
        // 1. Recupera il giocatore (per il nome)
        Player player =
            await context
                .Players.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == request.PlayerId, cancellationToken)
            ?? throw new KeyNotFoundException("Player not found");

        // 2. Ottimizzazione Bolt ⚡: Calcolo statistiche aggregate direttamente nel Database.
        // Invece di caricare migliaia di partite in memoria (O(N)), usiamo GroupBy e Sum/Count (O(1) transfer).
        var aggregateStats = await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played && m.Participants.Any(p => p.PlayerId == request.PlayerId))
            .Select(m => new
            {
                IsHome = m.Participants.Any(p => p.PlayerId == request.PlayerId && p.Side == Side.Home),
                m.ScoreHome,
                m.ScoreAway
            })
            .GroupBy(_ => 1)
            .Select(g => new
            {
                MatchesPlayed = g.Count(),
                Wins = g.Count(x => (x.IsHome && x.ScoreHome > x.ScoreAway) || (!x.IsHome && x.ScoreAway > x.ScoreHome)),
                Draws = g.Count(x => x.ScoreHome == x.ScoreAway),
                Losses = g.Count(x => (x.IsHome && x.ScoreHome < x.ScoreAway) || (!x.IsHome && x.ScoreAway < x.ScoreHome)),
                GoalsFor = g.Sum(x => x.IsHome ? x.ScoreHome : x.ScoreAway),
                GoalsAgainst = g.Sum(x => x.IsHome ? x.ScoreAway : x.ScoreHome)
            })
            .FirstOrDefaultAsync(cancellationToken);

        // 3. Ottimizzazione Bolt ⚡: Recupero solo le ultime 5 partite per la forma recente.
        var recentMatches = await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played && m.Participants.Any(p => p.PlayerId == request.PlayerId))
            .OrderByDescending(m => m.DatePlayed)
            .Take(5)
            .Select(m => new
            {
                IsHome = m.Participants.Any(p => p.PlayerId == request.PlayerId && p.Side == Side.Home),
                m.ScoreHome,
                m.ScoreAway
            })
            .ToListAsync(cancellationToken);

        // 4. Mappatura DTO
        var stats = new PlayerStatisticsDto
        {
            PlayerId = player.Id,
            Nickname = player.Nickname,
            MatchesPlayed = aggregateStats?.MatchesPlayed ?? 0,
            Wins = aggregateStats?.Wins ?? 0,
            Draws = aggregateStats?.Draws ?? 0,
            Losses = aggregateStats?.Losses ?? 0,
            GoalsFor = aggregateStats?.GoalsFor ?? 0,
            GoalsAgainst = aggregateStats?.GoalsAgainst ?? 0,
            RecentForm = recentMatches.Select(m =>
            {
                var myScore = m.IsHome ? m.ScoreHome : m.ScoreAway;
                var opponentScore = m.IsHome ? m.ScoreAway : m.ScoreHome;
                if (myScore > opponentScore) return "W";
                if (myScore < opponentScore) return "L";
                return "D";
            }).ToList()
        };

        return stats;
    }
}
