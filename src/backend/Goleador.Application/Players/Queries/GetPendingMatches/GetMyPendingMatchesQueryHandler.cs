using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
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
        Player player = await GetPlayerByUserIdAsync(cancellationToken);

        // Optimization Bolt ⚡: Replace eager loading (Include) with targeted projection.
        // This avoids loading full entity graphs (Tournaments, Teams, Players, Tables) which can be massive.
        // We only fetch the minimal fields required for the DTO.
        List<ProjectedMatch> pendingMatches = await GetPendingMatchesWithDetailsAsync(player.Id, cancellationToken);

        // Optimization Bolt ⚡: Targeted team resolution.
        // Instead of loading ALL teams from the database, we only fetch the names of teams involved in the pending matches.
        Dictionary<(Guid TournamentId, Guid PlayerId), string> playerTeamMap = await CreatePlayerTeamMapAsync(pendingMatches, cancellationToken);

        return [.. pendingMatches.Select(m => MapToPendingMatchDto(m, player.Id, playerTeamMap))];
    }

    async Task<Player> GetPlayerByUserIdAsync(CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException();
        }

        Player? player = await context.Players
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        return player == null ? throw new KeyNotFoundException("Player not found for current user") : player;
    }

    async Task<List<ProjectedMatch>> GetPendingMatchesWithDetailsAsync(Guid playerId, CancellationToken cancellationToken)
    {
        // Optimization Bolt ⚡: Selective projection reduces data transfer from O(Full Graph) to O(1) per record.
        return await context.Matches
            .AsNoTracking()
            .Where(m => m.Status == MatchStatus.Scheduled &&
                        m.Participants.Any(p => p.PlayerId == playerId))
            .OrderBy(m => m.Tournament != null ? m.Tournament.Name : string.Empty)
            .ThenBy(m => m.Round)
            .Select(m => new ProjectedMatch(
                m.Id,
                m.TournamentId,
                m.Tournament != null ? m.Tournament.Name : "Individual Match",
                m.Round,
                m.Table != null ? m.Table.Name : null,
                m.Participants.Select(p => new ProjectedParticipant(p.PlayerId, p.Side, p.Player.Nickname)).ToList()
            ))
            .ToListAsync(cancellationToken);
    }

    async Task<Dictionary<(Guid TournamentId, Guid PlayerId), string>> CreatePlayerTeamMapAsync(
        IEnumerable<ProjectedMatch> matches,
        CancellationToken cancellationToken)
    {
        var tournamentIds = matches
            .Where(m => m.TournamentId.HasValue)
            .Select(m => m.TournamentId!.Value)
            .Distinct()
            .ToList();

        if (tournamentIds.Count == 0)
        {
            return [];
        }

        var playerIds = matches
            .SelectMany(m => m.Participants.Select(p => p.PlayerId))
            .Distinct()
            .ToList();

        // Optimization Bolt ⚡: Targeted query for teams involved in these tournaments and containing these players.
        // Reduces database fetch from O(Total Teams in Tournament) to O(Involved Teams).
        var teams = await context.TournamentTeams
            .AsNoTracking()
            .Where(tt => tournamentIds.Contains(tt.TournamentId) && tt.Players.Any(p => playerIds.Contains(p.Id)))
            .Select(tt => new { tt.TournamentId, tt.Name, PlayerIds = tt.Players.Select(p => p.Id).ToList() })
            .ToListAsync(cancellationToken);

        // Optimization Bolt ⚡: Build a lookup dictionary to achieve O(1) team resolution.
        var playerTeamMap = new Dictionary<(Guid TournamentId, Guid PlayerId), string>();
        foreach (var team in teams)
        {
            foreach (Guid pId in team.PlayerIds)
            {
                playerTeamMap.TryAdd((team.TournamentId, pId), team.Name);
            }
        }

        return playerTeamMap;
    }

    static PendingMatchDto MapToPendingMatchDto(
        ProjectedMatch match,
        Guid currentPlayerId,
        IReadOnlyDictionary<(Guid TournamentId, Guid PlayerId), string> playerTeamMap)
    {
        ProjectedParticipant myParticipant = match.Participants.First(p => p.PlayerId == currentPlayerId);
        var opponentParticipants = match.Participants.Where(p => p.Side != myParticipant.Side).ToList();

        (string? homeTeamName, string? awayTeamName) = ResolveTeamNames(match, playerTeamMap);

        return new PendingMatchDto
        {
            Id = match.Id,
            TournamentId = match.TournamentId ?? Guid.Empty,
            TournamentName = match.TournamentName,
            HomeTeamName = homeTeamName,
            AwayTeamName = awayTeamName,
            Round = match.Round,
            TableName = match.TableName,
            OpponentName = string.Join(" - ", opponentParticipants.Select(p => p.Nickname))
        };
    }

    static (string HomeTeamName, string AwayTeamName) ResolveTeamNames(
        ProjectedMatch match,
        IReadOnlyDictionary<(Guid TournamentId, Guid PlayerId), string> playerTeamMap)
    {
        if (!match.TournamentId.HasValue)
        {
            return ("Home Team", "Away Team");
        }

        ProjectedParticipant? homeParticipant = match.Participants.FirstOrDefault(p => p.Side == Side.Home);
        ProjectedParticipant? awayParticipant = match.Participants.FirstOrDefault(p => p.Side == Side.Away);

        var homeTeamName = "Home Team";
        if (homeParticipant != null)
        {
            homeTeamName = playerTeamMap.GetValueOrDefault((match.TournamentId.Value, homeParticipant.PlayerId)) ?? "Home Team";
        }

        var awayTeamName = "Away Team";
        if (awayParticipant != null)
        {
            awayTeamName = playerTeamMap.GetValueOrDefault((match.TournamentId.Value, awayParticipant.PlayerId)) ?? "Away Team";
        }

        return (homeTeamName, awayTeamName);
    }

    record ProjectedMatch(
        Guid Id,
        Guid? TournamentId,
        string TournamentName,
        int Round,
        string? TableName,
        List<ProjectedParticipant> Participants
    );

    record ProjectedParticipant(Guid PlayerId, Side Side, string Nickname);
}
