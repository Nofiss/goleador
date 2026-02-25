using AutoMapper;
using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Enums;
using Goleador.Domain.ValueObjects;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Tournaments.Queries.GetTournamentById;

public class GetTournamentByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    : IRequestHandler<GetTournamentByIdQuery, TournamentDetailDto>
{
    public async Task<TournamentDetailDto> Handle(
        GetTournamentByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        // Optimization Bolt ⚡: Replace massive .Include() chains with a targeted LINQ projection.
        // This avoids fetching full entity graphs (O(N) data) and reduces memory usage (O(1) columns).
        // Using .Select() also avoids the overhead of entity tracking and materialization.
        TournamentData data = await context.Tournaments
            .AsNoTracking()
            .Where(t => t.Id == request.Id)
            .Select(t => new TournamentData(
                t.Id,
                t.Name,
                t.Status,
                t.Type,
                t.TeamSize,
                t.Rules,
                t.ScoringRules,
                t.HasReturnMatches,
                t.Registrations.Select(r => new RegistrationData(r.PlayerId, r.Player.Nickname)).ToList(),
                t.Teams.Select(tt => new TeamData(
                    tt.Id,
                    tt.Name,
                    tt.LogoUrl,
                    tt.SponsorUrl,
                    tt.Players.Select(p => new PlayerData(p.Id, p.Nickname)).ToList()
                )).ToList(),
                t.Matches.Select(m => new MatchData(
                    m.Id,
                    m.ScoreHome,
                    m.ScoreAway,
                    m.Round,
                    m.Status,
                    m.DatePlayed,
                    m.RowVersion,
                    m.TableId,
                    m.Table != null ? m.Table.Name : null,
                    m.Participants.Select(p => new ParticipantData(p.PlayerId, p.Side)).ToList(),
                    m.CardUsages.Select(cu => new CardUsageData(cu.TeamId, cu.CardDefinitionId)).ToList()
                )).ToList(),
                t.CardDefinitions.Select(cd => new CardData(cd.Id, cd.Name, cd.Description, cd.Effect)).ToList()
            ))
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new KeyNotFoundException("Tournament not found");

        // 2. Mappa base con AutoMapper per i campi semplici
        var dto = new TournamentDetailDto
        {
            Id = data.Id,
            Name = data.Name,
            Status = data.Status,
            Type = data.Type,
            TeamSize = data.TeamSize,
            Rules = data.Rules,
            HasReturnMatches = data.HasReturnMatches,
            ScoringRules = mapper.Map<ScoringRulesDto>(data.ScoringRules),
            RegisteredPlayers = data.Registrations.Select(r => new TeamPlayerDto { Id = r.PlayerId, Nickname = r.Nickname }).ToList(),
            Teams = data.Teams.Select(tt => new TeamDto
            {
                Id = tt.Id,
                Name = tt.Name,
                LogoUrl = tt.LogoUrl,
                SponsorUrl = tt.SponsorUrl,
                Players = tt.Players.Select(p => new TeamPlayerDto { Id = p.Id, Nickname = p.Nickname }).ToList()
            }).ToList(),
            CardDefinitions = data.CardDefinitions.Select(cd => new TournamentCardDto
            {
                Id = cd.Id,
                Name = cd.Name,
                Description = cd.Description,
                Effect = cd.Effect
            }).ToList()
        };

        // 3. Risoluzione nomi squadre per le partite
        // Ottimizzazione Bolt ⚡: Usiamo un dizionario per risolvere i nomi delle squadre in O(1) invece di scansioni O(N).
        Dictionary<Guid, (string Name, Guid Id)> playerTeamMap = BuildPlayerTeamMap(data.Teams);

        dto.Matches = data.Matches
            .Select(m => MapMatch(m, playerTeamMap))
            .OrderBy(m => m.Round)
            .ToList();

        return dto;
    }

    private static Dictionary<Guid, (string Name, Guid Id)> BuildPlayerTeamMap(List<TeamData> teams)
    {
        var playerTeamMap = new Dictionary<Guid, (string Name, Guid Id)>();
        foreach (var team in teams)
        {
            foreach (var player in team.Players)
            {
                playerTeamMap.TryAdd(player.Id, (team.Name, team.Id));
            }
        }
        return playerTeamMap;
    }

    private static TournamentMatchDto MapMatch(MatchData m, IReadOnlyDictionary<Guid, (string Name, Guid Id)> playerTeamMap)
    {
        var matchDto = new TournamentMatchDto
        {
            Id = m.Id,
            ScoreHome = m.ScoreHome,
            ScoreAway = m.ScoreAway,
            Round = m.Round,
            Status = m.Status,
            DatePlayed = m.DatePlayed,
            RowVersion = Convert.ToBase64String(m.RowVersion),
            TableId = m.TableId,
            TableName = m.TableName ?? string.Empty,
            CardUsages = m.CardUsages.Select(cu => new MatchCardUsageDto
            {
                TeamId = cu.TeamId,
                CardDefinitionId = cu.CardDefinitionId
            }).ToList()
        };

        // Estraiamo i partecipanti per assegnare team names e IDs
        var homeParticipant = m.Participants.FirstOrDefault(p => p.Side == Side.Home);
        var awayParticipant = m.Participants.FirstOrDefault(p => p.Side == Side.Away);

        if (homeParticipant != null && playerTeamMap.TryGetValue(homeParticipant.PlayerId, out var homeTeam))
        {
            matchDto.HomeTeamId = homeTeam.Id;
            matchDto.HomeTeamName = homeTeam.Name;
        }
        else
        {
            matchDto.HomeTeamName = "N/A";
        }

        if (awayParticipant != null && playerTeamMap.TryGetValue(awayParticipant.PlayerId, out var awayTeam))
        {
            matchDto.AwayTeamId = awayTeam.Id;
            matchDto.AwayTeamName = awayTeam.Name;
        }
        else
        {
            matchDto.AwayTeamName = "N/A";
        }

        return matchDto;
    }

    // Private records for optimized data transfer
    private record TournamentData(
        Guid Id,
        string Name,
        TournamentStatus Status,
        TournamentType Type,
        int TeamSize,
        string? Rules,
        TournamentScoringRules ScoringRules,
        bool HasReturnMatches,
        List<RegistrationData> Registrations,
        List<TeamData> Teams,
        List<MatchData> Matches,
        List<CardData> CardDefinitions
    );

    private record RegistrationData(Guid PlayerId, string Nickname);

    private record TeamData(
        Guid Id,
        string Name,
        string? LogoUrl,
        string? SponsorUrl,
        List<PlayerData> Players
    );

    private record PlayerData(Guid Id, string Nickname);

    private record MatchData(
        Guid Id,
        int ScoreHome,
        int ScoreAway,
        int Round,
        MatchStatus Status,
        DateTime DatePlayed,
        byte[] RowVersion,
        int? TableId,
        string? TableName,
        List<ParticipantData> Participants,
        List<CardUsageData> CardUsages
    );

    private record ParticipantData(Guid PlayerId, Side Side);

    private record CardUsageData(Guid TeamId, Guid CardDefinitionId);

    private record CardData(Guid Id, string Name, string Description, CardEffect Effect);
}
