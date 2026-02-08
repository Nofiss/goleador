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
                m.DatePlayed,
                m.ScoreHome,
                m.ScoreAway,
                m.Status,
                HomeNicknames = m.Participants
                    .Where(p => p.Side == Side.Home)
                    .Select(p => p.Player.Nickname)
                    .ToList(),
                AwayNicknames = m.Participants
                    .Where(p => p.Side == Side.Away)
                    .Select(p => p.Player.Nickname)
                    .ToList()
            })
            .ToListAsync(cancellationToken);

        return matches.Select(m => new MatchDto
        {
            Id = m.Id,
            DatePlayed = m.DatePlayed,
            ScoreHome = m.ScoreHome,
            ScoreAway = m.ScoreAway,
            HomeTeamName = m.HomeNicknames.Count == 0 ? "Unknown" : string.Join(" - ", m.HomeNicknames),
            AwayTeamName = m.AwayNicknames.Count == 0 ? "Unknown" : string.Join(" - ", m.AwayNicknames),
            Status = m.Status
        }).ToList();
    }
}
