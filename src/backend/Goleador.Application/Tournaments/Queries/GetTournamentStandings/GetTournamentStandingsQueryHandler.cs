using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using Goleador.Domain.ValueObjects;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Tournaments.Queries.GetTournamentStandings;

public class GetTournamentStandingsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetTournamentStandingsQuery, List<TournamentStandingDto>>
{
    public async Task<List<TournamentStandingDto>> Handle(
        GetTournamentStandingsQuery request,
        CancellationToken cancellationToken
    )
    {
        // 1. CARICAMENTO DATI (EAGER LOADING)
        // È fondamentale caricare la catena Teams -> Players per sapere chi gioca dove.
        Tournament tournament =
            await context
                .Tournaments.AsNoTracking()
                .AsSplitQuery() // Ottimizzazione Bolt ⚡: Carica le collezioni separatamente per evitare il prodotto cartesiano
                .Include(t => t.Teams)
                    .ThenInclude(tt => tt.Players)
                .Include(t => t.Matches)
                    .ThenInclude(m => m.Participants)
                .FirstOrDefaultAsync(t => t.Id == request.TournamentId, cancellationToken)
            ?? throw new KeyNotFoundException("Tournament not found");

        TournamentScoringRules rules = tournament.ScoringRules;

        // 2. CREA MAPPA: GIOCATORE ID -> SQUADRA ID
        // Questo risolve il problema di trovare la squadra.
        // Se un player (Guid) è nella squadra X, lo salviamo qui.
        var playerTeamMap = new Dictionary<Guid, Guid>();

        foreach (TournamentTeam team in tournament.Teams)
        {
            foreach (Player player in team.Players)
            {
                if (!playerTeamMap.ContainsKey(player.Id))
                {
                    playerTeamMap[player.Id] = team.Id;
                }
            }
        }

        // 3. INIZIALIZZA CLASSIFICA (Tutti a zero)
        var standingsMap = tournament.Teams.ToDictionary(
            team => team.Id,
            team => new TournamentStandingDto { TeamId = team.Id, TeamName = team.Name }
        );

        // 4. CALCOLA STATISTICHE E TOTALI PARTITE
        var totalScheduledMap = tournament.Teams.ToDictionary(team => team.Id, _ => 0);

        foreach (Match match in tournament.Matches)
        {
            // Ottimizzazione Bolt ⚡: Evitiamo multiple allocazioni LINQ e ToList() in un loop stretto.
            // Troviamo il Team ID basandoci sui partecipanti e la mappa playerTeamMap in un singolo passaggio.
            Guid homeTeamId = Guid.Empty;
            Guid awayTeamId = Guid.Empty;

            foreach (var participant in match.Participants)
            {
                if (participant.Side == Side.Home && homeTeamId == Guid.Empty)
                {
                    homeTeamId = playerTeamMap.GetValueOrDefault(participant.PlayerId);
                }
                else if (participant.Side == Side.Away && awayTeamId == Guid.Empty)
                {
                    awayTeamId = playerTeamMap.GetValueOrDefault(participant.PlayerId);
                }

                if (homeTeamId != Guid.Empty && awayTeamId != Guid.Empty)
                {
                    break;
                }
            }

            // Se non troviamo le squadre (dati sporchi o setup errato), saltiamo la partita
            if (homeTeamId == Guid.Empty || awayTeamId == Guid.Empty)
            {
                continue;
            }

            // Incrementiamo il totale delle partite programmate per le squadre
            totalScheduledMap[homeTeamId]++;
            totalScheduledMap[awayTeamId]++;

            // Se la partita non è stata giocata, non aggiorniamo le statistiche di classifica
            if (match.Status != MatchStatus.Played)
            {
                continue;
            }

            // Recuperiamo i DTO da aggiornare
            if (!standingsMap.TryGetValue(homeTeamId, out TournamentStandingDto? homeStats))
            {
                continue;
            }

            if (!standingsMap.TryGetValue(awayTeamId, out TournamentStandingDto? awayStats))
            {
                continue;
            }

            // --- AGGIORNAMENTO STATS ---

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
                // Home Vince
                homeStats.Won++;
                homeStats.Points += rules.PointsForWin;

                awayStats.Lost++;
                awayStats.Points += rules.PointsForLoss;
            }
            else if (match.ScoreHome < match.ScoreAway)
            {
                // Away Vince
                awayStats.Won++;
                awayStats.Points += rules.PointsForWin;

                homeStats.Lost++;
                homeStats.Points += rules.PointsForLoss;
            }
            else
            {
                // Pareggio
                homeStats.Drawn++;
                homeStats.Points += rules.PointsForDraw;

                awayStats.Drawn++;
                awayStats.Points += rules.PointsForDraw;
            }

            // --- BONUS ---

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

        // 5. CALCOLO PROIEZIONE
        foreach (var stats in standingsMap.Values)
        {
            int totalScheduled = totalScheduledMap.GetValueOrDefault(stats.TeamId);

            if (stats.Played > 0)
            {
                stats.PointsPerGame = (double)stats.Points / stats.Played;
                stats.MatchesRemaining = totalScheduled - stats.Played;

                // Proiezione = Punti Attuali + (Media * Rimanenti)
                stats.ProjectedPoints =
                    stats.Points + (int)Math.Round(stats.PointsPerGame * stats.MatchesRemaining);
            }
            else
            {
                // Se non ha giocato, proiezione a 0
                stats.ProjectedPoints = 0;
            }
        }

        // 6. ORDINAMENTO FINALE
        var ranking = standingsMap
            .Values.OrderByDescending(x => x.Points) // 1. Punti
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
