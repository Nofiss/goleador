using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Players.Queries.GetPlayerProfile;

public record GetPlayerProfileQuery(Guid PlayerId) : ICacheableQuery<PlayerProfileDto>
{
    public string CacheKey => $"PlayerProfile-{PlayerId}";
    public TimeSpan? Expiration => TimeSpan.FromMinutes(1);
}

public class GetPlayerProfileQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetPlayerProfileQuery, PlayerProfileDto>
{
    public async Task<PlayerProfileDto> Handle(
        GetPlayerProfileQuery request,
        CancellationToken cancellationToken
    )
    {
        // Ottimizzazione Bolt ⚡: Recupero solo i campi necessari del giocatore
        var player = await context.Players
            .AsNoTracking()
            .Where(p => p.Id == request.PlayerId)
            .Select(p => new { p.Id, p.FirstName, p.LastName, p.Nickname, p.EloRating })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new KeyNotFoundException("Player not found");

        // Ottimizzazione Bolt ⚡: Tutte le statistiche e i dati social sono calcolati lato Database (O(1) transfer)
        // Invece di scaricare migliaia di partite in memoria (O(N)), eseguiamo query mirate sequenziali.
        // Nota: Il DbContext non è thread-safe, quindi eseguiamo le query in sequenza.
        AggregateStats? stats = await GetAggregateStatsAsync(request.PlayerId, cancellationToken);
        List<MatchBriefDto> recentMatches = await GetRecentMatchesAsync(request.PlayerId, cancellationToken);
        RelatedPlayerDto? nemesis = await GetNemesisAsync(request.PlayerId, cancellationToken);
        RelatedPlayerDto? bestPartner = await GetBestPartnerAsync(request.PlayerId, cancellationToken);

        return new PlayerProfileDto
        {
            Id = player.Id,
            FullName = $"{player.FirstName} {player.LastName}".Trim(),
            Nickname = player.Nickname,
            EloRating = player.EloRating,
            TotalMatches = stats?.TotalMatches ?? 0,
            Wins = stats?.Wins ?? 0,
            Losses = stats?.Losses ?? 0,
            GoalsFor = stats?.GoalsFor ?? 0,
            GoalsAgainst = stats?.GoalsAgainst ?? 0,
            WinRate = (stats == null || stats.TotalMatches == 0)
                ? 0
                : Math.Round((double)stats.Wins / stats.TotalMatches * 100, 1),
            RecentMatches = recentMatches,
            Nemesis = nemesis,
            BestPartner = bestPartner
        };
    }

    async Task<AggregateStats?> GetAggregateStatsAsync(Guid playerId, CancellationToken cancellationToken)
    {
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
                g.Count(x => (x.IsHome && x.ScoreHome < x.ScoreAway) || (!x.IsHome && x.ScoreAway < x.ScoreHome)),
                g.Sum(x => x.IsHome ? x.ScoreHome : x.ScoreAway),
                g.Sum(x => x.IsHome ? x.ScoreAway : x.ScoreHome)
            ))
            .FirstOrDefaultAsync(cancellationToken);
    }

    async Task<List<MatchBriefDto>> GetRecentMatchesAsync(Guid playerId, CancellationToken cancellationToken)
    {
        var matches = await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played && m.Participants.Any(p => p.PlayerId == playerId))
            .OrderByDescending(m => m.DatePlayed)
            .Take(5)
            .Select(m => new
            {
                m.Id,
                m.DatePlayed,
                m.ScoreHome,
                m.ScoreAway,
                Participants = m.Participants.Select(p => new { p.PlayerId, p.Side, p.Player.Nickname }).ToList()
            })
            .ToListAsync(cancellationToken);

        return [.. matches.Select(m =>
        {
            var myParticipant = m.Participants.First(p => p.PlayerId == playerId);
            Side mySide = myParticipant.Side;
            var myScore = mySide == Side.Home ? m.ScoreHome : m.ScoreAway;
            var opponentScore = mySide == Side.Home ? m.ScoreAway : m.ScoreHome;

            var result = myScore > opponentScore ? "W" : (myScore < opponentScore ? "L" : "D");

            return new MatchBriefDto
            {
                Id = m.Id,
                DatePlayed = m.DatePlayed,
                ScoreHome = m.ScoreHome,
                ScoreAway = m.ScoreAway,
                HomeTeamName = string.Join(" - ", m.Participants.Where(p => p.Side == Side.Home).Select(p => p.Nickname)),
                AwayTeamName = string.Join(" - ", m.Participants.Where(p => p.Side == Side.Away).Select(p => p.Nickname)),
                Result = result
            };
        })];
    }

    async Task<RelatedPlayerDto?> GetNemesisAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played)
            .Where(m => (m.Participants.Any(p => p.PlayerId == playerId && p.Side == Side.Home) && m.ScoreHome < m.ScoreAway) ||
                        (m.Participants.Any(p => p.PlayerId == playerId && p.Side == Side.Away) && m.ScoreAway < m.ScoreHome))
            .SelectMany(m => m.Participants.Where(p => !m.Participants.Any(p2 => p2.PlayerId == playerId && p2.Side == p.Side)))
            .GroupBy(p => new { p.PlayerId, p.Player.Nickname })
            .Select(g => new RelatedPlayerDto
            {
                PlayerId = g.Key.PlayerId,
                Nickname = g.Key.Nickname,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .FirstOrDefaultAsync(cancellationToken);
    }

    async Task<RelatedPlayerDto?> GetBestPartnerAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played)
            .Where(m => (m.Participants.Any(p => p.PlayerId == playerId && p.Side == Side.Home) && m.ScoreHome > m.ScoreAway) ||
                        (m.Participants.Any(p => p.PlayerId == playerId && p.Side == Side.Away) && m.ScoreAway > m.ScoreHome))
            .SelectMany(m => m.Participants.Where(p => p.PlayerId != playerId && m.Participants.Any(p2 => p2.PlayerId == playerId && p2.Side == p.Side)))
            .GroupBy(p => new { p.PlayerId, p.Player.Nickname })
            .Select(g => new RelatedPlayerDto
            {
                PlayerId = g.Key.PlayerId,
                Nickname = g.Key.Nickname,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .FirstOrDefaultAsync(cancellationToken);
    }

    record AggregateStats(
        int TotalMatches,
        int Wins,
        int Losses,
        int GoalsFor,
        int GoalsAgainst
    );
}
