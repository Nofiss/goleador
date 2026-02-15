using Goleador.Domain.Common;
using Goleador.Domain.Enums;

namespace Goleador.Domain.Entities;

public class Match : BaseEntity
{
    public DateTime DatePlayed { get; private set; }
    public int ScoreHome { get; private set; }
    public int ScoreAway { get; private set; }
    public int Round { get; private set; }

    public MatchStatus Status { get; private set; }

    public Guid? TournamentId { get; private set; }
    public Tournament? Tournament { get; private set; }

    public int? TableId { get; private set; }
    public Table? Table { get; private set; }

    public byte[] RowVersion { get; set; } = [];

    readonly List<MatchParticipant> _participants = [];
    public IReadOnlyCollection<MatchParticipant> Participants => _participants.AsReadOnly();

    readonly List<MatchCardUsage> _cardUsages = [];
    public IReadOnlyCollection<MatchCardUsage> CardUsages => _cardUsages.AsReadOnly();

    Match() { } // Per EF Core

    public Match(
        int scoreHome,
        int scoreAway,
        Guid? tournamentId = null,
        int? tableId = null,
        int round = 1
    )
    {
        DatePlayed = DateTime.UtcNow;
        ScoreHome = scoreHome;
        ScoreAway = scoreAway;
        Round = round;
        Status = tournamentId.HasValue ? MatchStatus.Scheduled : MatchStatus.Played;
        TournamentId = tournamentId;
        TableId = tableId;
    }

    // Metodo helper per aggiungere giocatori
    public void AddParticipant(Guid playerId, Side side) =>
        // Qui potremmo aggiungere controlli (es. max 2 giocatori per lato)
        _participants.Add(new MatchParticipant(playerId, side));

    public void SetResult(int scoreHome, int scoreAway)
    {
        if (scoreHome < 0 || scoreAway < 0)
        {
            throw new ArgumentException("Scores cannot be negative.");
        }

        ScoreHome = scoreHome;
        ScoreAway = scoreAway;
        Status = MatchStatus.Played; // La partita passa a "Giocata"
        DatePlayed = DateTime.UtcNow; // Aggiorniamo la data all'effettivo momento dell'inserimento
    }

    public void AssignTable(int? tableId)
    {
        // Qui potresti aggiungere logica di validazione se necessario
        // Es. verificare se lo stato è già Played e impedire il cambio tavolo, se vuoi.
        TableId = tableId;
    }

    public void PlayCard(Guid teamId, Guid cardDefinitionId)
    {
        if (_cardUsages.Any(cu => cu.TeamId == teamId && cu.CardDefinitionId == cardDefinitionId))
        {
            return; // Già giocata in questa partita (evita duplicati se chiamato più volte)
        }

        _cardUsages.Add(new MatchCardUsage(Id, teamId, cardDefinitionId));
    }

    public void ClearCards()
    {
        _cardUsages.Clear();
    }
}
