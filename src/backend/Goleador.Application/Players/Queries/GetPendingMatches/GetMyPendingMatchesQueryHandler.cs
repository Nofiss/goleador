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
    // SonarQube: csharpsquid:S3776 - Cognitive Complexity reduced by extracting methods
    public async Task<List<PendingMatchDto>> Handle(GetMyPendingMatchesQuery request, CancellationToken cancellationToken)
    {
        var player = await GetPlayerByUserIdAsync(cancellationToken);

        var pendingMatches = await GetPendingMatchesWithDetailsAsync(player.Id, cancellationToken);

        var playerTeamMap = CreatePlayerTeamMap(pendingMatches);

        return pendingMatches
            .Select(m => MapToPendingMatchDto(m, player.Id, playerTeamMap))
            .ToList();
    }

    private async Task<Goleador.Domain.Entities.Player> GetPlayerByUserIdAsync(CancellationToken cancellationToken)
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

        return player;
    }

    private async Task<List<Goleador.Domain.Entities.Match>> GetPendingMatchesWithDetailsAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return await context.Matches
            .AsNoTracking()
            .AsSplitQuery() // Optimization Bolt ⚡: Prevents Cartesian product by loading collections in separate queries
            .Include(m => m.Tournament)
                .ThenInclude(t => t!.Teams)
                    .ThenInclude(tt => tt.Players)
            .Include(m => m.Table)
            .Include(m => m.Participants)
                .ThenInclude(p => p.Player)
            .Where(m => m.Status == MatchStatus.Scheduled &&
                        m.Participants.Any(p => p.PlayerId == playerId))
            .OrderBy(m => m.Tournament != null ? m.Tournament.Name : string.Empty)
            .ThenBy(m => m.Round)
            .ToListAsync(cancellationToken);
    }

    private static Dictionary<(Guid TournamentId, Guid PlayerId), string> CreatePlayerTeamMap(IEnumerable<Goleador.Domain.Entities.Match> matches)
    {
        // Optimization Bolt ⚡: Composite Relational Data Resolution Pattern
        // Build a dictionary of (TournamentId, PlayerId) -> TeamName in a single pass
        // to achieve O(1) lookups during projection, avoiding O(N*M) LINQ scans.
        var playerTeamMap = new Dictionary<(Guid TournamentId, Guid PlayerId), string>();
        var tournaments = matches
            .Where(m => m.Tournament != null)
            .Select(m => m.Tournament!)
            .DistinctBy(t => t.Id);

        foreach (var tournament in tournaments)
        {
            foreach (var team in tournament.Teams)
            {
                foreach (var teamPlayer in team.Players)
                {
                    playerTeamMap[(tournament.Id, teamPlayer.Id)] = team.Name;
                }
            }
        }

        return playerTeamMap;
    }

    private static PendingMatchDto MapToPendingMatchDto(
        Goleador.Domain.Entities.Match match,
        Guid currentPlayerId,
        IReadOnlyDictionary<(Guid TournamentId, Guid PlayerId), string> playerTeamMap)
    {
        var myParticipant = match.Participants.First(p => p.PlayerId == currentPlayerId);
        var opponentParticipants = match.Participants.Where(p => p.Side != myParticipant.Side).ToList();

        var (homeTeamName, awayTeamName) = ResolveTeamNames(match, playerTeamMap);

        return new PendingMatchDto
        {
            Id = match.Id,
            TournamentId = match.TournamentId ?? Guid.Empty,
            TournamentName = match.Tournament?.Name ?? "Individual Match",
            HomeTeamName = homeTeamName,
            AwayTeamName = awayTeamName,
            Round = match.Round,
            TableName = match.Table?.Name,
            OpponentName = string.Join(" - ", opponentParticipants.Select(p => p.Player.Nickname))
        };
    }

    private static (string HomeTeamName, string AwayTeamName) ResolveTeamNames(
        Goleador.Domain.Entities.Match match,
        IReadOnlyDictionary<(Guid TournamentId, Guid PlayerId), string> playerTeamMap)
    {
        if (match.Tournament == null)
        {
            return ("Home Team", "Away Team");
        }

        var homeParticipant = match.Participants.FirstOrDefault(p => p.Side == Side.Home);
        var awayParticipant = match.Participants.FirstOrDefault(p => p.Side == Side.Away);

        string homeTeamName = "Home Team";
        if (homeParticipant != null)
        {
            homeTeamName = playerTeamMap.GetValueOrDefault((match.Tournament.Id, homeParticipant.PlayerId)) ?? "Home Team";
        }

        string awayTeamName = "Away Team";
        if (awayParticipant != null)
        {
            awayTeamName = playerTeamMap.GetValueOrDefault((match.Tournament.Id, awayParticipant.PlayerId)) ?? "Away Team";
        }

        return (homeTeamName, awayTeamName) ;
    }
}
