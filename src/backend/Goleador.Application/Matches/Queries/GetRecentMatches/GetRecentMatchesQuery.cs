using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Matches.Queries.GetRecentMatches;

public record GetRecentMatchesQuery : IRequest<List<MatchDto>>;

public class GetRecentMatchesQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetRecentMatchesQuery, List<MatchDto>>
{
    public async Task<List<MatchDto>> Handle(GetRecentMatchesQuery request, CancellationToken cancellationToken)
    {
        var matches = await context.Matches
            .AsNoTracking()
            .Include(m => m.Participants)
                .ThenInclude(p => p.Player)
            .Where(m => m.Status == MatchStatus.Played)
            .OrderByDescending(m => m.DatePlayed)
            .Take(10)
            .ToListAsync(cancellationToken);

        return matches.Select(m => new MatchDto
        {
            Id = m.Id,
            DatePlayed = m.DatePlayed,
            ScoreHome = m.ScoreHome,
            ScoreAway = m.ScoreAway,
            HomeTeamName = GetTeamName(m, Side.Home),
            AwayTeamName = GetTeamName(m, Side.Away),
            Status = m.Status
        }).ToList();
    }

    private string GetTeamName(Match match, Side side)
    {
        var participants = match.Participants.Where(p => p.Side == side).ToList();
        if (participants.Count == 0) return "Unknown";
        return string.Join(" - ", participants.Select(p => p.Player.Nickname));
    }
}
