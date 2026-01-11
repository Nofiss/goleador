using Goleador.Domain.Common;

namespace Goleador.Domain.Entities;

public class TournamentTeam : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public Guid TournamentId { get; private set; }
    public Tournament Tournament { get; private set; } = null!;

    // I giocatori che compongono la squadra (1 o 2)
    readonly List<Player> _players = [];
    public IReadOnlyCollection<Player> Players => _players.AsReadOnly();

    TournamentTeam() { }

    public TournamentTeam(Guid tournamentId, string name, IEnumerable<Player> players)
    {
        TournamentId = tournamentId;
        Name = name;
        _players.AddRange(players);
    }
}
