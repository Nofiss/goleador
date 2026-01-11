using Goleador.Domain.Entities;
using Goleador.Domain.Enums;

namespace Goleador.Application.Tournaments.Services;

public static class RoundRobinScheduler
{
    public static List<Match> GenerateMatches(Tournament tournament, List<TournamentTeam> teams)
    {
        var matches = new List<Match>();
        var teamsCount = teams.Count;

        // Se le squadre sono dispari, aggiungiamo una squadra "Dummy" (chi gioca contro Dummy riposa)
        if (teamsCount % 2 != 0)
        {
            teams.Add(null!); // Null rappresenta il "Riposo"
            teamsCount++;
        }

        var numRounds = teamsCount - 1;
        var matchesPerRound = teamsCount / 2;

        // Algoritmo di Berger (Circle Method)
        // Immagina le squadre in cerchio. Una sta ferma, le altre ruotano.
        for (var round = 0; round < numRounds; round++)
        {
            for (var i = 0; i < matchesPerRound; i++)
            {
                TournamentTeam teamHome = teams[i];
                TournamentTeam teamAway = teams[teamsCount - 1 - i];

                // Se una delle due squadre è null (Dummy), è un turno di riposo -> Niente partita
                if (teamHome == null || teamAway == null)
                {
                    continue;
                }

                // Creiamo la partita (Andata)
                // Alterniamo casa/trasferta in base al round per bilanciare (algoritmo standard)
                if (round % 2 == 0)
                {
                    matches.Add(CreateMatch(tournament.Id, teamHome, teamAway));
                }
                else
                {
                    matches.Add(CreateMatch(tournament.Id, teamAway, teamHome));
                }
            }

            // Rotazione delle squadre per il prossimo round
            // Teniamo fissa la prima squadra (indice 0) e ruotiamo le altre
            TournamentTeam lastTeam = teams[teamsCount - 1];
            teams.RemoveAt(teamsCount - 1);
            teams.Insert(1, lastTeam);
        }

        // Gestione Ritorno (Return Matches)
        if (tournament.HasReturnMatches)
        {
            var returnMatches = new List<Match>();
            foreach (Match match in matches)
            {
                // Creiamo una nuova partita invertendo i partecipanti
                // Nota: Dobbiamo estrarre i player dai partecipanti della partita di andata
                var homeParticipants = match.Participants.Where(p => p.Side == Side.Home).Select(p => p.PlayerId).ToList();
                var awayParticipants = match.Participants.Where(p => p.Side == Side.Away).Select(p => p.PlayerId).ToList();

                // Per ricreare il match di ritorno serve l'ID del torneo e i team originali...
                // Semplifichiamo: cloniamo la logica usando i team originali sarebbe stato più pulito,
                // ma dato che abbiamo già le entità Match, invertiamo semplicemente i lati.

                // Nota tecnica: Qui stiamo creando una nuova entità Match.
                // Poiché non abbiamo i riferimenti diretti ai Team nell'entità Match (ma solo ai Player),
                // dobbiamo ricostruirla dai player.
                // MA ASPETTA: Per semplicità, in questo scheduler abbiamo accesso agli oggetti 'teamHome' e 'teamAway' nel loop sopra.
                // È meglio generare il ritorno SUBITO nel loop o duplicare la lista alla fine?
                // Duplichiamo la logica è più sicuro.
            }

            // Approccio più semplice per il ritorno: 
            // Rieseguiamo il loop scambiando Home e Away alla creazione.
            // (Per brevità di codice qui, duplichiamo la lista matches creata invertendo i campi)
            var returnRoundMatches = new List<Match>();
            foreach (Match m in matches)
            {
                // Nota: Qui è complesso clonare l'entità Match perché i partecipanti sono una collection privata.
                // È meglio se il metodo CreateMatch accetta i Team e noi lo richiamiamo invertito.
                // Ma i Team nella lista originale sono stati ruotati!
                // SOLUZIONE: Lasciamo stare la clonazione complessa e facciamo un secondo giro di generazione se necessario,
                // oppure (più semplice) accettiamo che il ritorno sia gestito duplicando l'algoritmo.
            }
        }

        // CORREZIONE LOGICA RITORNO:
        // Il modo più pulito con l'algoritmo di Berger è generare il ritorno semplicemente invertendo Home/Away
        // nella lista generata.
        if (tournament.HasReturnMatches)
        {
            // Creiamo una lista temporanea per il ritorno
            var returnMatches = new List<Match>();

            foreach (Match m in matches)
            {
                // Dobbiamo risalire ai Team per ricreare il match pulito.
                // Poiché Match non ha "TeamId", è rischioso. 
                // PER QUESTO ESEMPIO: Semplifichiamo. Se c'è ritorno, 
                // assumiamo che per ogni match A vs B, ne creiamo uno B vs A.
                // Ma ci servono gli ID dei giocatori.

                // Recuperiamo i player Home e Away dal match appena creato
                var homePlayers = m.Participants.Where(p => p.Side == Side.Home).Select(p => p.Player).ToList();
                var awayPlayers = m.Participants.Where(p => p.Side == Side.Away).Select(p => p.Player).ToList();

                var returnMatch = new Match(0, 0, tournament.Id); // Score 0-0
                // Impostiamo lo stato come Scheduled (0)
                // (Assumiamo che il costruttore o default lo metta a Scheduled, e score a 0)

                foreach (Player? p in awayPlayers)
                {
                    returnMatch.AddParticipant(p.Id, Side.Home); // Vecchi Away diventano Home
                }

                foreach (Player? p in homePlayers)
                {
                    returnMatch.AddParticipant(p.Id, Side.Away); // Vecchi Home diventano Away
                }

                returnMatches.Add(returnMatch);
            }
            matches.AddRange(returnMatches);
        }

        return matches;
    }

    static Match CreateMatch(Guid tournamentId, TournamentTeam home, TournamentTeam away)
    {
        var match = new Match(0, 0, tournamentId); // Score iniziale 0-0

        // Aggiungiamo i giocatori della squadra Home
        foreach (Player player in home.Players)
        {
            match.AddParticipant(player.Id, Side.Home);
        }

        // Aggiungiamo i giocatori della squadra Away
        foreach (Player player in away.Players)
        {
            match.AddParticipant(player.Id, Side.Away);
        }

        return match;
    }
}
