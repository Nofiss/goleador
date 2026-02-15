using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Enums;
using Goleador.Domain.ValueObjects;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Tournaments.Queries.GetTournamentStandings;

// SonarQube: csharpsquid:S3776
public class GetTournamentStandingsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetTournamentStandingsQuery, List<TournamentStandingDto>>
{
    public async Task<List<TournamentStandingDto>> Handle(
        GetTournamentStandingsQuery request,
        CancellationToken cancellationToken
    )
    {
        // 1. CARICAMENTO DATI (PROJECTION)
        // Ottimizzazione Bolt ⚡: Usiamo una proiezione mirata per caricare solo i campi necessari.
        // Questo evita di scaricare centinaia di entità Player e Match complete, riducendo il traffico dati (O(1) transfer).
        TournamentStandingsData data = await GetTournamentStandingsDataAsync(request.TournamentId, cancellationToken);

        // 2. CREA MAPPA: GIOCATORE ID -> SQUADRA ID
        Dictionary<Guid, Guid> playerTeamMap = BuildPlayerTeamMap(data.Teams);

        // 3. INIZIALIZZA CLASSIFICA (Tutti a zero)
        Dictionary<Guid, TournamentStandingDto> standingsMap = InitializeStandings(data.Teams);

        // 4. CALCOLA STATISTICHE E TOTALI PARTITE
        ProcessMatches(data.Matches, playerTeamMap, standingsMap, data.ScoringRules);

        // 5. CALCOLO PROIEZIONE
        CalculateProjections(standingsMap.Values);

        // 6. ORDINAMENTO FINALE
        return RankStandings(standingsMap.Values);
    }

    async Task<TournamentStandingsData> GetTournamentStandingsDataAsync(Guid tournamentId, CancellationToken cancellationToken)
    {
        return await context.Tournaments
            .AsNoTracking()
            .Where(t => t.Id == tournamentId)
            .Select(t => new TournamentStandingsData(
                t.ScoringRules,
                t.Teams.Select(team => new TeamData(
                    team.Id,
                    team.Name,
                    team.Players.Select(p => p.Id).ToList()
                )).ToList(),
                t.Matches.Select(m => new MatchData(
                    m.Status,
                    m.ScoreHome,
                    m.ScoreAway,
                    m.Participants.Select(p => new ParticipantData(
                        p.PlayerId,
                        p.Side
                    )).ToList(),
                    m.CardUsages.Select(cu => new CardUsageData(
                        cu.TeamId,
                        cu.CardDefinition!.Effect
                    )).ToList()
                )).ToList()
            ))
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new KeyNotFoundException("Tournament not found");
    }

    static Dictionary<Guid, Guid> BuildPlayerTeamMap(IEnumerable<TeamData> teams)
    {
        var playerTeamMap = new Dictionary<Guid, Guid>();

        foreach (TeamData team in teams)
        {
            foreach (Guid playerId in team.PlayerIds)
            {
                playerTeamMap.TryAdd(playerId, team.Id);
            }
        }

        return playerTeamMap;
    }

    static Dictionary<Guid, TournamentStandingDto> InitializeStandings(IEnumerable<TeamData> teams)
    {
        return teams.ToDictionary(
            team => team.Id,
            team => new TournamentStandingDto { TeamId = team.Id, TeamName = team.Name, MatchesRemaining = 0 }
        );
    }

    static void ProcessMatches(
        IEnumerable<MatchData> matches,
        IReadOnlyDictionary<Guid, Guid> playerTeamMap,
        IReadOnlyDictionary<Guid, TournamentStandingDto> standingsMap,
        TournamentScoringRules rules)
    {
        foreach (MatchData match in matches)
        {
            // Risoluzione immediata delle squadre dai partecipanti.
            ParticipantData? homeParticipant = match.Participants.FirstOrDefault(p => p.Side == Side.Home);
            ParticipantData? awayParticipant = match.Participants.FirstOrDefault(p => p.Side == Side.Away);

            if (homeParticipant == null || awayParticipant == null)
            {
                continue;
            }

            Guid homeTeamId = playerTeamMap.GetValueOrDefault(homeParticipant.PlayerId);
            Guid awayTeamId = playerTeamMap.GetValueOrDefault(awayParticipant.PlayerId);

            if (homeTeamId == Guid.Empty || awayTeamId == Guid.Empty)
            {
                continue;
            }

            if (!standingsMap.TryGetValue(homeTeamId, out TournamentStandingDto? homeStats) ||
                !standingsMap.TryGetValue(awayTeamId, out TournamentStandingDto? awayStats))
            {
                continue;
            }

            homeStats.MatchesRemaining++;
            awayStats.MatchesRemaining++;

            if (match.Status == MatchStatus.Played)
            {
                UpdateMatchStats(match, homeStats, awayStats, rules);
            }
        }
    }

    static void UpdateMatchStats(
        MatchData match,
        TournamentStandingDto homeStats,
        TournamentStandingDto awayStats,
        TournamentScoringRules rules)
    {
        // Partite Giocate
        homeStats.Played++;
        awayStats.Played++;

        // Goal
        homeStats.GoalsFor += match.ScoreHome;
        homeStats.GoalsAgainst += match.ScoreAway;
        awayStats.GoalsFor += match.ScoreAway;
        awayStats.GoalsAgainst += match.ScoreHome;

        // Vittoria / Pareggio / Sconfitta
        if (match.ScoreHome > match.ScoreAway)
        {
            homeStats.Won++;

            var points = rules.PointsForWin;
            if (match.CardUsages.Any(cu => cu.TeamId == homeStats.TeamId && cu.Effect == CardEffect.DoublePoints))
            {
                points *= 2;
            }
            homeStats.Points += points;

            awayStats.Lost++;
            awayStats.Points += rules.PointsForLoss;
        }
        else if (match.ScoreHome < match.ScoreAway)
        {
            awayStats.Won++;

            var points = rules.PointsForWin;
            if (match.CardUsages.Any(cu => cu.TeamId == awayStats.TeamId && cu.Effect == CardEffect.DoublePoints))
            {
                points *= 2;
            }
            awayStats.Points += points;

            homeStats.Lost++;
            homeStats.Points += rules.PointsForLoss;
        }
        else
        {
            homeStats.Drawn++;
            homeStats.Points += rules.PointsForDraw;
            awayStats.Drawn++;
            awayStats.Points += rules.PointsForDraw;
        }

        ApplyBonuses(match, homeStats, awayStats, rules);
    }

    static void ApplyBonuses(
        MatchData match,
        TournamentStandingDto homeStats,
        TournamentStandingDto awayStats,
        TournamentScoringRules rules)
    {
        // Bonus Goal Soglia
        if (rules.GoalThreshold.HasValue)
        {
            if (match.ScoreHome >= rules.GoalThreshold.Value)
            {
                homeStats.Points += rules.GoalThresholdBonus;
            }

            if (match.ScoreAway >= rules.GoalThreshold.Value)
            {
                awayStats.Points += rules.GoalThresholdBonus;
            }
        }

        // Bonus Cappotto (10-0)
        if (rules.EnableTenZeroBonus)
        {
            if (match.ScoreHome >= 10 && match.ScoreAway == 0)
            {
                homeStats.Points += rules.TenZeroBonus;
            }

            if (match.ScoreAway >= 10 && match.ScoreHome == 0)
            {
                awayStats.Points += rules.TenZeroBonus;
            }
        }
    }

    static void CalculateProjections(IEnumerable<TournamentStandingDto> standings)
    {
        foreach (TournamentStandingDto stats in standings)
        {
            // Sottraiamo le giocate per ottenere le rimanenti effettive.
            stats.MatchesRemaining -= stats.Played;

            if (stats.Played > 0)
            {
                stats.PointsPerGame = (double)stats.Points / stats.Played;
                // Proiezione = Punti Attuali + (Media * Rimanenti)
                stats.ProjectedPoints = stats.Points + (int)Math.Round(stats.PointsPerGame * stats.MatchesRemaining);
            }
            else
            {
                stats.ProjectedPoints = 0;
            }
        }
    }

    static List<TournamentStandingDto> RankStandings(IEnumerable<TournamentStandingDto> standings)
    {
        var ranking = standings
            .OrderByDescending(x => x.Points) // 1. Punti
            .ThenByDescending(x => x.GoalDifference) // 2. Differenza Reti
            .ThenByDescending(x => x.GoalsFor) // 3. Goal Fatti
            .ThenBy(x => x.TeamName) // 4. Alfabetico
            .ToList();

        // Assegna posizioni (1, 2, 3...)
        for (var i = 0; i < ranking.Count; i++)
        {
            ranking[i].Position = i + 1;
        }

        return ranking;
    }

    record TournamentStandingsData(
        TournamentScoringRules ScoringRules,
        List<TeamData> Teams,
        List<MatchData> Matches
    );

    record TeamData(Guid Id, string Name, List<Guid> PlayerIds);

    record MatchData(
        MatchStatus Status,
        int ScoreHome,
        int ScoreAway,
        List<ParticipantData> Participants,
        List<CardUsageData> CardUsages
    );

    record ParticipantData(Guid PlayerId, Side Side);

    record CardUsageData(Guid TeamId, CardEffect Effect);
}
