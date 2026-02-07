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
    // SonarQube: csharpsquid:S3776 - Cognitive Complexity reduced by extracting logical blocks into private methods.
    public async Task<PlayerStatisticsDto> Handle(
        GetPlayerStatisticsQuery request,
        CancellationToken cancellationToken
    )
    {
        var player = await GetPlayerAsync(request.PlayerId, cancellationToken);

        var aggregateStats = await GetAggregateStatsAsync(request.PlayerId, cancellationToken);

        var recentMatches = await GetRecentMatchesAsync(request.PlayerId, cancellationToken);

        return MapToDto(player, aggregateStats, recentMatches);
    }

    private async Task<Player> GetPlayerAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return await context.Players.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == playerId, cancellationToken)
            ?? throw new KeyNotFoundException("Player not found");
    }

    private async Task<AggregateStats?> GetAggregateStatsAsync(Guid playerId, CancellationToken cancellationToken)
    {
        // Ottimizzazione Bolt ⚡: Calcolo statistiche aggregate direttamente nel Database (O(1) transfer).
        return await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played && m.Participants.Any(p => p.PlayerId == playerId))
            .Select(m => new
            {
                IsHome = m.Participants.Any(p => p.PlayerId == playerId && p.Side == Side.Home),
                m.ScoreHome,
                m.ScoreAway
            })
            .GroupBy(_ => 1)
            .Select(g => new AggregateStats(
                g.Count(),
                g.Count(x => (x.IsHome && x.ScoreHome > x.ScoreAway) || (!x.IsHome && x.ScoreAway > x.ScoreHome)),
                g.Count(x => x.ScoreHome == x.ScoreAway),
                g.Count(x => (x.IsHome && x.ScoreHome < x.ScoreAway) || (!x.IsHome && x.ScoreAway < x.ScoreHome)),
                g.Sum(x => x.IsHome ? x.ScoreHome : x.ScoreAway),
                g.Sum(x => x.IsHome ? x.ScoreAway : x.ScoreHome)
            ))
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<List<RecentMatchInfo>> GetRecentMatchesAsync(Guid playerId, CancellationToken cancellationToken)
    {
        // Ottimizzazione Bolt ⚡: Recupero solo le ultime 5 partite per la forma recente.
        return await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played && m.Participants.Any(p => p.PlayerId == playerId))
            .OrderByDescending(m => m.DatePlayed)
            .Take(5)
            .Select(m => new RecentMatchInfo(
                m.Participants.Any(p => p.PlayerId == playerId && p.Side == Side.Home),
                m.ScoreHome,
                m.ScoreAway
            ))
            .ToListAsync(cancellationToken);
    }

    private static PlayerStatisticsDto MapToDto(Player player, AggregateStats? aggregateStats, List<RecentMatchInfo> recentMatches)
    {
        return new PlayerStatisticsDto
        {
            PlayerId = player.Id,
            Nickname = player.Nickname,
            MatchesPlayed = aggregateStats?.MatchesPlayed ?? 0,
            Wins = aggregateStats?.Wins ?? 0,
            Draws = aggregateStats?.Draws ?? 0,
            Losses = aggregateStats?.Losses ?? 0,
            GoalsFor = aggregateStats?.GoalsFor ?? 0,
            GoalsAgainst = aggregateStats?.GoalsAgainst ?? 0,
            RecentForm = recentMatches.Select(m => MapToResult(m.IsHome, m.ScoreHome, m.ScoreAway)).ToList()
        };
    }

    private static string MapToResult(bool isHome, int scoreHome, int scoreAway)
    {
        var myScore = isHome ? scoreHome : scoreAway;
        var opponentScore = isHome ? scoreAway : scoreHome;

        if (myScore > opponentScore) return "W";
        if (myScore < opponentScore) return "L";
        return "D";
    }

    private record AggregateStats(
        int MatchesPlayed,
        int Wins,
        int Draws,
        int Losses,
        int GoalsFor,
        int GoalsAgainst
    );

    private record RecentMatchInfo(
        bool IsHome,
        int ScoreHome,
        int ScoreAway
    );
}
