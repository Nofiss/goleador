using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using Goleador.Domain.ValueObjects;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Tournaments.Queries.GetTournamentStandings;

public record GetTournamentStandingsQuery(Guid TournamentId)
    : IRequest<List<TournamentStandingDto>>;

public class GetTournamentStandingsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetTournamentStandingsQuery, List<TournamentStandingDto>>
{
    public async Task<List<TournamentStandingDto>> Handle(
        GetTournamentStandingsQuery request,
        CancellationToken cancellationToken
    )
    {
        // 1. Recupera Torneo, Squadre e Partite (solo quelle GIOCATE)
        Tournament tournament =
            await context
                .Tournaments.AsNoTracking()
                .Include(t => t.Teams)
                .Include(t => t.Matches)
                .FirstOrDefaultAsync(t => t.Id == request.TournamentId, cancellationToken)
            ?? throw new KeyNotFoundException("Tournament not found");

        TournamentScoringRules rules = tournament.ScoringRules;

        // 2. Inizializza la mappa delle statistiche per ogni squadra
        var standingsMap = tournament.Teams.ToDictionary(
            team => team.Id,
            team => new TournamentStandingDto { TeamId = team.Id, TeamName = team.Name }
        );

        // 3. Itera su tutte le partite FINITE (Status = Played)
        IEnumerable<Match> playedMatches = tournament.Matches.Where(m =>
            m.Status == MatchStatus.Played
        );

        foreach (Match match in playedMatches)
        {
            // Dobbiamo identificare le squadre Home e Away.
            // Nel Match abbiamo i Participants (Player), non direttamente il TeamId (per come è fatto il dominio Match).
            // PERÒ: Nel backend dello Scheduler, non abbiamo salvato il TeamId nel Match (grave pecca del dominio semplificato Match).

            // FIX RAPIDO: Per far funzionare la classifica ora, dobbiamo risalire al Team guardando i giocatori.
            // Dato che TournamentTeam contiene i Player, possiamo fare il match inverso.

            // Recupera gli ID dei giocatori partecipanti al match per lato
            var homePlayerIds = match
                .Participants.Where(p => p.Side == Side.Home)
                .Select(p => p.PlayerId)
                .ToHashSet();
            var awayPlayerIds = match
                .Participants.Where(p => p.Side == Side.Away)
                .Select(p => p.PlayerId)
                .ToHashSet();

            // Trova quale TournamentTeam corrisponde a questi giocatori
            // (Funziona se i player non cambiano squadra durante il torneo, che è vero)
            TournamentTeam? homeTeam = tournament.Teams.FirstOrDefault(t =>
                t.Players.Any(p => homePlayerIds.Contains(p.Id))
            );
            TournamentTeam? awayTeam = tournament.Teams.FirstOrDefault(t =>
                t.Players.Any(p => awayPlayerIds.Contains(p.Id))
            );

            if (homeTeam == null || awayTeam == null)
            {
                continue; // Skip se dati corrotti
            }

            TournamentStandingDto homeStats = standingsMap[homeTeam.Id];
            TournamentStandingDto awayStats = standingsMap[awayTeam.Id];

            // Aggiorna Goal e Partite Giocate
            homeStats.Played++;
            awayStats.Played++;
            homeStats.GoalsFor += match.ScoreHome;
            homeStats.GoalsAgainst += match.ScoreAway;
            awayStats.GoalsFor += match.ScoreAway;
            awayStats.GoalsAgainst += match.ScoreHome;

            // --- CALCOLO PUNTI BASE ---
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
            else // Pareggio
            {
                homeStats.Drawn++;
                homeStats.Points += rules.PointsForDraw;
                awayStats.Drawn++;
                awayStats.Points += rules.PointsForDraw;
            }

            // --- CALCOLO BONUS ---

            // 1. Bonus Goal Soglia (es. 1 punto se segni 4+ goal)
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

            // 2. Bonus Cappotto (10-0)
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

        // 4. Ordinamento Classifica
        // Criteri: Punti > Differenza Reti > Goal Fatti > Nome
        var ranking = standingsMap
            .Values.OrderByDescending(x => x.Points)
            .ThenByDescending(x => x.GoalDifference)
            .ThenByDescending(x => x.GoalsFor)
            .ThenBy(x => x.TeamName)
            .ToList();

        // Assegna posizioni (1°, 2°, 3°...)
        for (var i = 0; i < ranking.Count; i++)
        {
            ranking[i].Position = i + 1;
        }

        return ranking;
    }
}
