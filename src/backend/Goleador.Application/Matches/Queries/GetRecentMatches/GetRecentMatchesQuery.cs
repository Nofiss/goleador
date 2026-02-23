using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Matches.Queries.GetRecentMatches;

public record GetRecentMatchesQuery : ICacheableQuery<List<MatchDto>>
{
    public string CacheKey => "RecentMatches";
    public TimeSpan? Expiration => TimeSpan.FromMinutes(1);
}

public class GetRecentMatchesQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetRecentMatchesQuery, List<MatchDto>>
{
    public async Task<List<MatchDto>> Handle(GetRecentMatchesQuery request, CancellationToken cancellationToken)
    {
        // Optimization Bolt ⚡: Use .Select() projection instead of .Include().
        // This fetches only required fields and avoids instantiating full entities for Match, Participant and Player.
        // It significantly reduces data transfer and memory pressure (O(1) columns instead of fetching full entity graphs).
        var matchesData = await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Played)
            .OrderByDescending(m => m.DatePlayed)
            .Take(10)
            .Select(m => new
            {
                m.Id,
                m.TournamentId,
                m.DatePlayed,
                m.ScoreHome,
                m.ScoreAway,
                m.Status,
                Participants = m.Participants.Select(p => new { p.PlayerId, p.Side, p.Player.Nickname }).ToList(),
                CardUsages = m.CardUsages.Select(cu => new { cu.TeamId }).ToList()
            })
            .ToListAsync(cancellationToken);

        // Optimization Bolt ⚡: Resolve participant IDs in memory instead of using database subqueries.
        // This reduces database roundtrips and simplifies the generated SQL (from 20 subqueries to 0).
        var matches = matchesData.Select(m => new
        {
            m.Id,
            m.TournamentId,
            m.DatePlayed,
            m.ScoreHome,
            m.ScoreAway,
            m.Status,
            m.Participants,
            m.CardUsages,
            HomeParticipantId = m.Participants.Where(p => p.Side == Side.Home).Select(p => p.PlayerId).FirstOrDefault(),
            AwayParticipantId = m.Participants.Where(p => p.Side == Side.Away).Select(p => p.PlayerId).FirstOrDefault(),
        }).ToList();

        var tournamentIds = matches.Where(m => m.TournamentId.HasValue).Select(m => m.TournamentId!.Value).Distinct().ToList();

        // Optimization Bolt ⚡: Targeted team resolution.
        // Instead of fetching ALL teams for all involved tournaments (which could be hundreds),
        // we only fetch teams that contain at least one of the players from the recent matches.
        // This reduces records fetched from O(Teams in Tournaments) to O(Matches), significantly lowering memory and data transfer.
        var playerIds = matches
            .SelectMany(m => new[] { m.HomeParticipantId, m.AwayParticipantId })
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();

        // Skip query if no tournaments are involved
        var teams = tournamentIds.Count == 0
            ? []
            : await context.TournamentTeams
                .Where(tt => tournamentIds.Contains(tt.TournamentId) && tt.Players.Any(p => playerIds.Contains(p.Id)))
                .Select(tt => new { tt.Id, tt.TournamentId, PlayerIds = tt.Players.Select(p => p.Id).ToList() })
                .ToListAsync(cancellationToken);

        // Optimization Bolt ⚡: Build a lookup dictionary to achieve O(1) team resolution instead of O(T) scan per match.
        var teamLookupMap = teams
            .SelectMany(t => t.PlayerIds.Select(pId => new { Key = (t.TournamentId, pId), TeamId = t.Id }))
            .ToDictionary(x => x.Key, x => x.TeamId);

        return [.. matches.Select(m =>
        {
            Guid? homeTeamId = null;
            Guid? awayTeamId = null;

            if (m.TournamentId.HasValue)
            {
                homeTeamId = teamLookupMap.GetValueOrDefault((m.TournamentId.Value, m.HomeParticipantId));
                awayTeamId = teamLookupMap.GetValueOrDefault((m.TournamentId.Value, m.AwayParticipantId));

                // If GetValueOrDefault returns Guid.Empty (not found), we treat it as null for the DTO
                if (homeTeamId == Guid.Empty)
                {
                    homeTeamId = null;
                }

                if (awayTeamId == Guid.Empty)
                {
                    awayTeamId = null;
                }
            }

            var homeNicks = m.Participants.Where(p => p.Side == Side.Home).Select(p => p.Nickname).ToList();
            var awayNicks = m.Participants.Where(p => p.Side == Side.Away).Select(p => p.Nickname).ToList();

            return new MatchDto
            {
                Id = m.Id,
                DatePlayed = m.DatePlayed,
                ScoreHome = m.ScoreHome,
                ScoreAway = m.ScoreAway,
                HomeTeamName = homeNicks.Count == 0 ? "Unknown" : string.Join(" - ", homeNicks),
                AwayTeamName = awayNicks.Count == 0 ? "Unknown" : string.Join(" - ", awayNicks),
                Status = m.Status,
                HasCardsHome = homeTeamId.HasValue && m.CardUsages.Any(cu => cu.TeamId == homeTeamId),
                HasCardsAway = awayTeamId.HasValue && m.CardUsages.Any(cu => cu.TeamId == awayTeamId)
            };
        })];
    }
}
