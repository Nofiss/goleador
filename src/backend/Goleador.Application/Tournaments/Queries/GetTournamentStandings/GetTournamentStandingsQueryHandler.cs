using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
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
        // 1. CARICAMENTO DATI (EAGER LOADING)
        var tournament = await GetTournamentWithDataAsync(request.TournamentId, cancellationToken);

        // 2. CREA MAPPA: GIOCATORE ID -> SQUADRA ID
        var playerTeamMap = BuildPlayerTeamMap(tournament.Teams);

        // 3. INIZIALIZZA CLASSIFICA (Tutti a zero)
        var standingsMap = InitializeStandings(tournament.Teams);

        // 4. CALCOLA STATISTICHE E TOTALI PARTITE
        ProcessMatches(tournament.Matches, playerTeamMap, standingsMap, tournament.ScoringRules);

        // 5. CALCOLO PROIEZIONE
        CalculateProjections(standingsMap.Values);

        // 6. ORDINAMENTO FINALE
        return RankStandings(standingsMap.Values);
    }

    private async Task<Tournament> GetTournamentWithDataAsync(Guid tournamentId, CancellationToken cancellationToken)
    {
        return await context
            .Tournaments.AsNoTracking()
            .AsSplitQuery() // Ottimizzazione Bolt ⚡: Carica le collezioni separatamente per evitare il prodotto cartesiano
            .Include(t => t.Teams)
                .ThenInclude(tt => tt.Players)
            .Include(t => t.Matches)
                .ThenInclude(m => m.Participants)
            .FirstOrDefaultAsync(t => t.Id == tournamentId, cancellationToken)
            ?? throw new KeyNotFoundException("Tournament not found");
    }

    private static Dictionary<Guid, Guid> BuildPlayerTeamMap(IEnumerable<TournamentTeam> teams)
    {
        var playerTeamMap = new Dictionary<Guid, Guid>();

        foreach (TournamentTeam team in teams)
        {
            foreach (Player player in team.Players)
            {
                playerTeamMap.TryAdd(player.Id, team.Id);
            }
        }

        return playerTeamMap;
    }

    private static Dictionary<Guid, TournamentStandingDto> InitializeStandings(IEnumerable<TournamentTeam> teams)
    {
        return teams.ToDictionary(
            team => team.Id,
            team => new TournamentStandingDto { TeamId = team.Id, TeamName = team.Name, MatchesRemaining = 0 }
        );
    }

    private static void ProcessMatches(
        IEnumerable<Match> matches,
        IReadOnlyDictionary<Guid, Guid> playerTeamMap,
        IReadOnlyDictionary<Guid, TournamentStandingDto> standingsMap,
        TournamentScoringRules rules)
    {
        foreach (Match match in matches)
        {
            // Risoluzione immediata delle squadre dai partecipanti.
            // Se un match ha più partecipanti per lato (es. 2v2), usiamo il primo per identificare il team.
            var homeParticipant = match.Participants.FirstOrDefault(p => p.Side == Side.Home);
            var awayParticipant = match.Participants.FirstOrDefault(p => p.Side == Side.Away);

            if (homeParticipant == null || awayParticipant == null) continue;

            Guid homeTeamId = playerTeamMap.GetValueOrDefault(homeParticipant.PlayerId);
            Guid awayTeamId = playerTeamMap.GetValueOrDefault(awayParticipant.PlayerId);

            // Se non troviamo le squadre (dati sporchi o setup errato), saltiamo la partita
            if (homeTeamId == Guid.Empty || awayTeamId == Guid.Empty) continue;

            // Recuperiamo i DTO da aggiornare
            if (!standingsMap.TryGetValue(homeTeamId, out var homeStats) ||
                !standingsMap.TryGetValue(awayTeamId, out var awayStats))
            {
                continue;
            }

            // Incrementiamo il totale delle partite programmate (temporaneamente in MatchesRemaining)
            homeStats.MatchesRemaining++;
            awayStats.MatchesRemaining++;

            // Se la partita è stata giocata, aggiorniamo le statistiche
            if (match.Status == MatchStatus.Played)
            {
                UpdateMatchStats(match, homeStats, awayStats, rules);
            }
        }
    }

    private static void UpdateMatchStats(
        Match match,
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
            homeStats.Points += rules.PointsForWin;
            awayStats.Lost++;
            awayStats.Points += rules.PointsForLoss;
        }
        else if (match.ScoreHome < match.ScoreAway)
        {
            awayStats.Won++;
            awayStats.Points += rules.PointsForWin;
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

    private static void ApplyBonuses(
        Match match,
        TournamentStandingDto homeStats,
        TournamentStandingDto awayStats,
        TournamentScoringRules rules)
    {
        // Bonus Goal Soglia
        if (rules.GoalThreshold.HasValue)
        {
            if (match.ScoreHome >= rules.GoalThreshold.Value) homeStats.Points += rules.GoalThresholdBonus;
            if (match.ScoreAway >= rules.GoalThreshold.Value) awayStats.Points += rules.GoalThresholdBonus;
        }

        // Bonus Cappotto (10-0)
        if (rules.EnableTenZeroBonus)
        {
            if (match.ScoreHome >= 10 && match.ScoreAway == 0) homeStats.Points += rules.TenZeroBonus;
            if (match.ScoreAway >= 10 && match.ScoreHome == 0) awayStats.Points += rules.TenZeroBonus;
        }
    }

    private static void CalculateProjections(IEnumerable<TournamentStandingDto> standings)
    {
        foreach (var stats in standings)
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

    private static List<TournamentStandingDto> RankStandings(IEnumerable<TournamentStandingDto> standings)
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
}
