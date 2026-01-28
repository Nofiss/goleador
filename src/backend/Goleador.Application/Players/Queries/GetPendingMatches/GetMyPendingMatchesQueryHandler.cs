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

        return pendingMatches.Select(m => {
            var myParticipant = m.Participants.First(p => p.PlayerId == player.Id);
            var mySide = myParticipant.Side;
            var opponentParticipants = m.Participants.Where(p => p.Side != mySide).ToList();

            // Resolve team names if it's a tournament match
            string homeTeamName = "Home Team";
            string awayTeamName = "Away Team";

            if (m.Tournament != null)
            {
                var homePlayerIds = m.Participants.Where(p => p.Side == Side.Home).Select(p => p.PlayerId).ToList();
                var awayPlayerIds = m.Participants.Where(p => p.Side == Side.Away).Select(p => p.PlayerId).ToList();

                homeTeamName = m.Tournament.Teams
                    .FirstOrDefault(t => t.Players.Any(p => homePlayerIds.Contains(p.Id)))?.Name ?? "Home Team";
                awayTeamName = m.Tournament.Teams
                    .FirstOrDefault(t => t.Players.Any(p => awayPlayerIds.Contains(p.Id)))?.Name ?? "Away Team";
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
