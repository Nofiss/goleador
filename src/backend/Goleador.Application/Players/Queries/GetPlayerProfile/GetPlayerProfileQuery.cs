using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Players.Queries.GetPlayerProfile;

public record GetPlayerProfileQuery(Guid PlayerId) : IRequest<PlayerProfileDto>;

public class GetPlayerProfileQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetPlayerProfileQuery, PlayerProfileDto>
{
    public async Task<PlayerProfileDto> Handle(
        GetPlayerProfileQuery request,
        CancellationToken cancellationToken
    )
    {
        var player = await context.Players
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.PlayerId, cancellationToken)
            ?? throw new KeyNotFoundException("Player not found");

        // Bolt ⚡ Optimization: Database-side aggregation for stats and relationships.
        // Instead of loading all historical matches into memory (O(N) transfer), we perform
        // targeted queries that return only the final results (O(1) transfer).

        // 1. Aggregate Statistics
        var stats = await context.Matches
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
                TotalMatches = g.Count(),
                Wins = g.Count(x => (x.IsHome && x.ScoreHome > x.ScoreAway) || (!x.IsHome && x.ScoreAway > x.ScoreHome)),
                Losses = g.Count(x => (x.IsHome && x.ScoreHome < x.ScoreAway) || (!x.IsHome && x.ScoreAway < x.ScoreHome)),
                GoalsFor = g.Sum(x => x.IsHome ? x.ScoreHome : x.ScoreAway),
                GoalsAgainst = g.Sum(x => x.IsHome ? x.ScoreAway : x.ScoreHome)
            })
            .FirstOrDefaultAsync(cancellationToken);

        // 2. Recent Matches (Top 5)
        var recentMatches = await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played && m.Participants.Any(p => p.PlayerId == request.PlayerId))
            .OrderByDescending(m => m.DatePlayed)
            .Take(5)
            .Select(m => new {
                m.Id,
                m.DatePlayed,
                m.ScoreHome,
                m.ScoreAway,
                Participants = m.Participants.Select(p => new { p.PlayerId, p.Side, p.Player.Nickname }).ToList()
            })
            .ToListAsync(cancellationToken);

        // 3. Nemesis (Opponent with most wins against me)
        // We fetch the list of opponents from lost matches and aggregate them.
        var nemesisList = await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played && m.Participants.Any(p => p.PlayerId == request.PlayerId))
            .Select(m => new {
                IsHome = m.Participants.Any(p => p.PlayerId == request.PlayerId && p.Side == Side.Home),
                m.ScoreHome,
                m.ScoreAway,
                Opponents = m.Participants
                    .Where(p => p.Side != (m.Participants.Any(p2 => p2.PlayerId == request.PlayerId && p2.Side == Side.Home) ? Side.Home : Side.Away))
                    .Select(p => new { p.PlayerId, p.Player.Nickname })
            })
            .Where(x => (x.IsHome && x.ScoreHome < x.ScoreAway) || (!x.IsHome && x.ScoreAway < x.ScoreHome))
            .SelectMany(x => x.Opponents)
            .ToListAsync(cancellationToken);

        var topNemesis = nemesisList
            .GroupBy(n => new { n.PlayerId, n.Nickname })
            .OrderByDescending(g => g.Count())
            .FirstOrDefault();

        // 4. Best Partner (Teammate in won matches)
        var partnerList = await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played && m.Participants.Any(p => p.PlayerId == request.PlayerId))
            .Select(m => new {
                IsHome = m.Participants.Any(p => p.PlayerId == request.PlayerId && p.Side == Side.Home),
                m.ScoreHome,
                m.ScoreAway,
                Teammate = m.Participants
                    .Where(p => p.PlayerId != request.PlayerId &&
                               p.Side == (m.Participants.Any(p2 => p2.PlayerId == request.PlayerId && p2.Side == Side.Home) ? Side.Home : Side.Away))
                    .Select(p => new { p.PlayerId, p.Player.Nickname })
                    .FirstOrDefault()
            })
            .Where(x => (x.IsHome && x.ScoreHome > x.ScoreAway) || (!x.IsHome && x.ScoreAway > x.ScoreHome))
            .Where(x => x.Teammate != null)
            .Select(x => x.Teammate)
            .ToListAsync(cancellationToken);

        var topPartner = partnerList
            .GroupBy(p => new { p!.PlayerId, p.Nickname })
            .OrderByDescending(g => g.Count())
            .FirstOrDefault();

        var dto = new PlayerProfileDto
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
            WinRate = (stats?.TotalMatches ?? 0) == 0 ? 0 : Math.Round((double)stats!.Wins / stats.TotalMatches * 100, 1),
            Nemesis = topNemesis == null ? null : new RelatedPlayerDto { PlayerId = topNemesis.Key.PlayerId, Nickname = topNemesis.Key.Nickname, Count = topNemesis.Count() },
            BestPartner = topPartner == null ? null : new RelatedPlayerDto { PlayerId = topPartner.Key.PlayerId, Nickname = topPartner.Key.Nickname, Count = topPartner.Count() },
            RecentMatches = recentMatches.Select(m => {
                var myParticipant = m.Participants.First(p => p.PlayerId == request.PlayerId);
                var mySide = myParticipant.Side;
                var myScore = mySide == Side.Home ? m.ScoreHome : m.ScoreAway;
                var oppScore = mySide == Side.Home ? m.ScoreAway : m.ScoreHome;
                return new MatchBriefDto {
                    Id = m.Id,
                    DatePlayed = m.DatePlayed,
                    ScoreHome = m.ScoreHome,
                    ScoreAway = m.ScoreAway,
                    HomeTeamName = string.Join(" - ", m.Participants.Where(p => p.Side == Side.Home).Select(p => p.Nickname)),
                    AwayTeamName = string.Join(" - ", m.Participants.Where(p => p.Side == Side.Away).Select(p => p.Nickname)),
                    Result = myScore > oppScore ? "W" : (myScore < oppScore ? "L" : "D")
                };
            }).ToList()
        };

        return dto;
    }
}
