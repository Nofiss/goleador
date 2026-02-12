using Goleador.Domain.Common;

namespace Goleador.Domain.Entities;

public class TournamentTeam : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? LogoUrl { get; private set; }
    public string? SponsorUrl { get; private set; }
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

    public void Rename(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
        {
            throw new ArgumentException("Team name cannot be empty.");
        }

        Name = newName.Trim();
    }

    public void UpdateBranding(string? logoUrl, string? sponsorUrl)
    {
        LogoUrl = logoUrl;
        SponsorUrl = sponsorUrl;
    }
}
