using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
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
        var matches = await context.Matches
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
                HomeParticipantId = m.Participants.Where(p => p.Side == Side.Home).Select(p => p.PlayerId).FirstOrDefault(),
                AwayParticipantId = m.Participants.Where(p => p.Side == Side.Away).Select(p => p.PlayerId).FirstOrDefault(),
                HomeNicknames = m.Participants
                    .Where(p => p.Side == Side.Home)
                    .Select(p => p.Player.Nickname)
                    .ToList(),
                AwayNicknames = m.Participants
                    .Where(p => p.Side == Side.Away)
                    .Select(p => p.Player.Nickname)
                    .ToList(),
                CardUsages = m.CardUsages.Select(cu => new { cu.TeamId }).ToList()
            })
            .ToListAsync(cancellationToken);

        var tournamentIds = matches.Where(m => m.TournamentId.HasValue).Select(m => m.TournamentId!.Value).Distinct().ToList();
        var teams = await context.TournamentTeams
            .Where(tt => tournamentIds.Contains(tt.TournamentId))
            .Select(tt => new { tt.Id, tt.TournamentId, PlayerIds = tt.Players.Select(p => p.Id).ToList() })
            .ToListAsync(cancellationToken);

        return matches.Select(m => {
            Guid? homeTeamId = null;
            Guid? awayTeamId = null;

            if (m.TournamentId.HasValue)
            {
                homeTeamId = teams.FirstOrDefault(t => t.TournamentId == m.TournamentId && t.PlayerIds.Contains(m.HomeParticipantId))?.Id;
                awayTeamId = teams.FirstOrDefault(t => t.TournamentId == m.TournamentId && t.PlayerIds.Contains(m.AwayParticipantId))?.Id;
            }

            return new MatchDto
            {
                Id = m.Id,
                DatePlayed = m.DatePlayed,
                ScoreHome = m.ScoreHome,
                ScoreAway = m.ScoreAway,
                HomeTeamName = m.HomeNicknames.Count == 0 ? "Unknown" : string.Join(" - ", m.HomeNicknames),
                AwayTeamName = m.AwayNicknames.Count == 0 ? "Unknown" : string.Join(" - ", m.AwayNicknames),
                Status = m.Status,
                HasCardsHome = homeTeamId.HasValue && m.CardUsages.Any(cu => cu.TeamId == homeTeamId),
                HasCardsAway = awayTeamId.HasValue && m.CardUsages.Any(cu => cu.TeamId == awayTeamId)
            };
        }).ToList();
    }
}
