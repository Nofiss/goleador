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
            .AsSplitQuery() // Bolt ⚡ Optimization: Load collections separately to avoid Cartesian product
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

        // Bolt ⚡ Optimization: Pre-calculate player-to-team map for all relevant tournaments
        // This avoids nested LINQ loops (O(N*M)) during DTO projection in memory.
        var processedTournaments = new HashSet<Guid>();
        var playerTeamMap = new Dictionary<(Guid TournamentId, Guid PlayerId), string>();
        foreach (var match in pendingMatches)
        {
            if (match.Tournament != null && processedTournaments.Add(match.Tournament.Id))
            {
                foreach (var team in match.Tournament.Teams)
                {
                    foreach (var p in team.Players)
                    {
                        playerTeamMap[(match.Tournament.Id, p.Id)] = team.Name;
                    }
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
                // Bolt ⚡ Optimization: Use O(1) dictionary lookup instead of O(M) nested Any()
                homeTeamName = m.Participants
                    .Where(p => p.Side == Side.Home)
                    .Select(p => playerTeamMap.GetValueOrDefault((m.Tournament.Id, p.PlayerId)))
                    .FirstOrDefault(name => name != null) ?? "Home Team";

                awayTeamName = m.Participants
                    .Where(p => p.Side == Side.Away)
                    .Select(p => playerTeamMap.GetValueOrDefault((m.Tournament.Id, p.PlayerId)))
                    .FirstOrDefault(name => name != null) ?? "Away Team";
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
