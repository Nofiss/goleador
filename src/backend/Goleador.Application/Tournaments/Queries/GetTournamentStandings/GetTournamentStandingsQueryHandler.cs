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

        // 4. CALCOLA STATISTICHE DALLE PARTITE GIOCATE
        IEnumerable<Match> playedMatches = tournament.Matches.Where(m =>
            m.Status == MatchStatus.Played
        );

        foreach (Match match in playedMatches)
        {
            // Troviamo gli ID dei giocatori partecipanti per lato
            var homePlayerIds = match
                .Participants.Where(p => p.Side == Side.Home)
                .Select(p => p.PlayerId)
                .ToList();

            var awayPlayerIds = match
                .Participants.Where(p => p.Side == Side.Away)
                .Select(p => p.PlayerId)
                .ToList();

            // Troviamo il Team ID basandoci sul primo giocatore trovato nella mappa
            // (Assumiamo che tutti i giocatori di un lato appartengano alla stessa squadra)
            Guid homeTeamId = homePlayerIds
                .Select(id => playerTeamMap.GetValueOrDefault(id))
                .FirstOrDefault(id => id != Guid.Empty);
            Guid awayTeamId = awayPlayerIds
                .Select(id => playerTeamMap.GetValueOrDefault(id))
                .FirstOrDefault(id => id != Guid.Empty);

            // Se non troviamo le squadre (dati sporchi o setup errato), saltiamo la partita
            if (homeTeamId == Guid.Empty || awayTeamId == Guid.Empty)
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

        // 5. ORDINAMENTO FINALE
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
