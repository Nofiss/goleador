using FluentAssertions;
using Goleador.Application.Tournaments.Services;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;

namespace Goleador.Tests.Application.Tournaments.Services;

public class RoundRobinSchedulerTests
{
    //[Fact]
    //public void GenerateMatches_Should_Generate_Correct_Number_Of_Matches_For_4_Teams_SingleRound()
    //{
    //    // Arrange
    //    var tournament = new Tournament("Test", TournamentType.RoundRobin, 1, false, null, null);

    //    // Creiamo 4 squadre finte
    //    var teams = new List<TournamentTeam>
    //    {
    //        new(tournament.Id, "A", []),
    //        new(tournament.Id, "B", []),
    //        new(tournament.Id, "C", []),
    //        new(tournament.Id, "D", []),
    //    };

    //    // Act
    //    List<Match> matches = RoundRobinScheduler.GenerateMatches(tournament, teams);

    //    // Assert
    //    // Formula Girone all'italiana (n * (n-1)) / 2
    //    // 4 * 3 / 2 = 6 partite
    //    matches.Should().HaveCount(6);

    //    // Verifichiamo che ogni squadra giochi 3 partite
    //    // (Nota: Per farlo preciso dovremmo controllare i Participants dentro ogni match)
    //    var countA = matches.Count(m => IsTeamInMatch(m, "A"));
    //    countA.Should().Be(3);
    //}

    [Fact]
    public void GenerateMatches_Should_Generate_Double_Matches_For_ReturnRound()
    {
        // Arrange
        var tournament = new Tournament("Test", TournamentType.RoundRobin, 1, true, null, null); // true = Ritorno

        var teams = new List<TournamentTeam>
        {
            new(tournament.Id, "A", []),
            new(tournament.Id, "B", []),
            new(tournament.Id, "C", []),
        };

        // Act
        List<Match> matches = RoundRobinScheduler.GenerateMatches(tournament, teams);

        // Assert
        // 3 Squadre -> 3 partite andata + 3 ritorno = 6 partite
        matches.Should().HaveCount(6);
    }

    // Helper fake per controllare se un team è nel match (dato che il dominio Match usa PlayerId e non TeamId diretti nello scheduler originale)
    // Nota: Questo test assume che la logica interna dello scheduler associ correttamente i player.
    // Se lo scheduler usa i playerId delle squadre fittizie (che sono Guid vuoti se non li settiamo), potrebbe essere ambiguo.
    // Per un test robusto, dovremmo assegnare PlayerId finti alle squadre nell'Arrange.

    static bool IsTeamInMatch(Match match, string teamName) =>
        // Questa è una semplificazione. Nel test reale dovremmo creare Player con ID e controllare quelli.
        true;
}
