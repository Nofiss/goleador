using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Players.Queries.GetPendingMatches;

public class GetMyPendingMatchesQueryHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService)
    : IRequestHandler<GetMyPendingMatchesQuery, List<PendingMatchDto>>
{
    public async Task<List<PendingMatchDto>> Handle(GetMyPendingMatchesQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException();
        }

        var player = await context.Players
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (player == null)
        {
            throw new KeyNotFoundException("Player not found for current user");
        }

        var pendingMatches = await context.Matches
            .AsNoTracking()
            .AsSplitQuery() // Optimization Bolt ⚡: Prevents Cartesian product by loading collections in separate queries
            .Include(m => m.Tournament)
                .ThenInclude(t => t!.Teams)
                    .ThenInclude(tt => tt.Players)
            .Include(m => m.Table)
            .Include(m => m.Participants)
                .ThenInclude(p => p.Player)
            .Where(m => m.Status == MatchStatus.Scheduled &&
                        m.Participants.Any(p => p.PlayerId == player.Id))
            .OrderBy(m => m.Tournament != null ? m.Tournament.Name : string.Empty)
            .ThenBy(m => m.Round)
            .ToListAsync(cancellationToken);

        // Optimization Bolt ⚡: Composite Relational Data Resolution Pattern
        // Build a dictionary of (TournamentId, PlayerId) -> TeamName in a single pass
        // to achieve O(1) lookups during projection, avoiding O(N*M) LINQ scans.
        var playerTeamMap = new Dictionary<(Guid TournamentId, Guid PlayerId), string>();
        foreach (var tournament in pendingMatches.Where(m => m.Tournament != null).Select(m => m.Tournament!).DistinctBy(t => t.Id))
        {
            foreach (var team in tournament.Teams)
            {
                foreach (var teamPlayer in team.Players)
                {
                    playerTeamMap[(tournament.Id, teamPlayer.Id)] = team.Name;
                }
            }
        }

        return pendingMatches.Select(m => {
            var myParticipant = m.Participants.First(p => p.PlayerId == player.Id);
            var mySide = myParticipant.Side;
            var opponentParticipants = m.Participants.Where(p => p.Side != mySide).ToList();

            // Resolve team names if it's a tournament match
            string homeTeamName = "Home Team";
            string awayTeamName = "Away Team";

            if (m.Tournament != null)
            {
                var homeParticipant = m.Participants.FirstOrDefault(p => p.Side == Side.Home);
                var awayParticipant = m.Participants.FirstOrDefault(p => p.Side == Side.Away);

                if (homeParticipant != null)
                {
                    homeTeamName = playerTeamMap.GetValueOrDefault((m.Tournament.Id, homeParticipant.PlayerId)) ?? "Home Team";
                }

                if (awayParticipant != null)
                {
                    awayTeamName = playerTeamMap.GetValueOrDefault((m.Tournament.Id, awayParticipant.PlayerId)) ?? "Away Team";
                }
            }

            return new PendingMatchDto
            {
                Id = m.Id,
                TournamentId = m.TournamentId ?? Guid.Empty,
                TournamentName = m.Tournament?.Name ?? "Individual Match",
                HomeTeamName = homeTeamName,
                AwayTeamName = awayTeamName,
                Round = m.Round,
                TableName = m.Table?.Name,
                OpponentName = string.Join(" - ", opponentParticipants.Select(p => p.Player.Nickname))
            };
        }).ToList();
    }
}
