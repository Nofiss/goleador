using Goleador.Domain.Entities;
using Goleador.Domain.Enums;

namespace Goleador.Application.Tournaments.Services;

public static class RoundRobinScheduler
{
    // SonarQube: csharpsquid:S3776 - Refactored to reduce cognitive complexity from 21 to below 15.
    public static List<Match> GenerateMatches(Tournament tournament, List<TournamentTeam> teams)
    {
        var workingTeams = new List<TournamentTeam>(teams);
        EnsureEvenTeams(workingTeams);

        var numRounds = workingTeams.Count - 1;
        List<Match> matches = GenerateFirstLegMatches(tournament, workingTeams, numRounds);

        if (tournament.HasReturnMatches)
        {
            matches.AddRange(GenerateReturnLegMatches(tournament, matches, numRounds));
        }

        return matches;
    }

    static void EnsureEvenTeams(List<TournamentTeam> teams)
    {
        if (teams.Count % 2 != 0)
        {
            teams.Add(null!); // Null represents a "Rest" round
        }
    }

    static List<Match> GenerateFirstLegMatches(Tournament tournament, List<TournamentTeam> teams, int numRounds)
    {
        var matches = new List<Match>();
        var matchesPerRound = teams.Count / 2;

        for (var round = 0; round < numRounds; round++)
        {
            var roundNumber = round + 1;
            matches.AddRange(GenerateRoundMatches(tournament, teams, round, roundNumber, matchesPerRound));
            RotateTeams(teams);
        }

        return matches;
    }

    static List<Match> GenerateRoundMatches(Tournament tournament, List<TournamentTeam> teams, int roundIdx, int roundNumber, int matchesPerRound)
    {
        var roundMatches = new List<Match>();
        var teamsCount = teams.Count;

        for (var i = 0; i < matchesPerRound; i++)
        {
            TournamentTeam teamHome = teams[i];
            TournamentTeam teamAway = teams[teamsCount - 1 - i];

            if (teamHome == null || teamAway == null)
            {
                continue;
            }

            // Alternate home/away based on round to balance scheduling
            if (roundIdx % 2 == 0)
            {
                roundMatches.Add(CreateMatch(tournament.Id, teamHome, teamAway, roundNumber));
            }
            else
            {
                roundMatches.Add(CreateMatch(tournament.Id, teamAway, teamHome, roundNumber));
            }
        }

        return roundMatches;
    }

    static void RotateTeams(List<TournamentTeam> teams)
    {
        var teamsCount = teams.Count;
        TournamentTeam lastTeam = teams[teamsCount - 1];
        teams.RemoveAt(teamsCount - 1);
        teams.Insert(1, lastTeam);
    }

    static List<Match> GenerateReturnLegMatches(Tournament tournament, List<Match> firstLegMatches, int firstLegRounds)
    {
        var returnMatches = new List<Match>();

        foreach (Match m in firstLegMatches)
        {
            var returnRoundNumber = m.Round + firstLegRounds;
            var homePlayers = m.Participants.Where(p => p.Side == Side.Home).Select(p => p.PlayerId).ToList();
            var awayPlayers = m.Participants.Where(p => p.Side == Side.Away).Select(p => p.PlayerId).ToList();

            var returnMatch = new Match(0, 0, tournament.Id, null, returnRoundNumber);

            foreach (Guid id in awayPlayers)
            {
                returnMatch.AddParticipant(id, Side.Home);
            }

            foreach (Guid id in homePlayers)
            {
                returnMatch.AddParticipant(id, Side.Away);
            }

            returnMatches.Add(returnMatch);
        }

        return returnMatches;
    }

    static Match CreateMatch(Guid tournamentId, TournamentTeam home, TournamentTeam away, int round)
    {
        var match = new Match(0, 0, tournamentId, null, round);

        foreach (Player player in home.Players)
        {
            match.AddParticipant(player.Id, Side.Home);
        }

        foreach (Player player in away.Players)
        {
            match.AddParticipant(player.Id, Side.Away);
        }

        return match;
    }
}
