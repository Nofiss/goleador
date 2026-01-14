namespace Goleador.Application.Common.Interfaces;

public interface ITeamGeneratorService
{
    // Riceve ID e "Skill Score" dei giocatori, restituisce lista di coppie di ID
    Task<List<(Guid Player1, Guid Player2)>> GenerateBalancedTeamsAsync(
        Dictionary<Guid, double> playerSkills
    );
}
