using Goleador.Domain.Common;
using Goleador.Domain.Enums;
using Goleador.Domain.ValueObjects;

namespace Goleador.Domain.Entities;

public class Tournament : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public TournamentType Type { get; private set; }
    public TournamentStatus Status { get; private set; }

    // Configurazione
    public int TeamSize { get; private set; } // 1 per 1vs1, 2 per 2vs2
    public bool HasReturnMatches { get; private set; } // Andata e Ritorno?
    public string? Notes { get; private set; }
    public TournamentScoringRules ScoringRules { get; private set; } =
        TournamentScoringRules.Default();

    // Relazioni
    readonly List<TournamentRegistration> _registrations = [];
    public IReadOnlyCollection<TournamentRegistration> Registrations => _registrations.AsReadOnly();

    readonly List<TournamentTeam> _teams = [];
    public IReadOnlyCollection<TournamentTeam> Teams => _teams.AsReadOnly();

    readonly List<Match> _matches = [];
    public IReadOnlyCollection<Match> Matches => _matches.AsReadOnly();

    Tournament() { }

    public Tournament(
        string name,
        TournamentType type,
        int teamSize,
        bool hasReturnMatches,
        string? notes,
        TournamentScoringRules? scoringRules
    )
    {
        Name = name;
        Type = type;
        TeamSize = teamSize;
        HasReturnMatches = hasReturnMatches;
        Notes = notes;
        ScoringRules = scoringRules ?? TournamentScoringRules.Default();
        Status = TournamentStatus.Setup;
    }

    // Metodi di dominio
    public void RegisterPlayer(Guid playerId)
    {
        if (Status != TournamentStatus.Setup)
        {
            throw new InvalidOperationException("Registration is closed.");
        }

        if (_registrations.Any(r => r.PlayerId == playerId))
        {
            throw new InvalidOperationException("Player already registered.");
        }

        _registrations.Add(new TournamentRegistration(Id, playerId));
    }

    public void RegisterTeam(TournamentTeam team)
    {
        if (Status != TournamentStatus.Setup)
        {
            throw new InvalidOperationException("Cannot add teams once tournament has started.");
        }

        if (team.Players.Count != TeamSize)
        {
            throw new InvalidOperationException(
                $"This tournament requires teams of {TeamSize} player(s)."
            );
        }

        _teams.Add(team);
    }

    public void StartTournament()
    {
        if (_teams.Count < 2)
        {
            throw new InvalidOperationException("Need at least 2 teams to start.");
        }

        Status = TournamentStatus.Active;
    }
}
