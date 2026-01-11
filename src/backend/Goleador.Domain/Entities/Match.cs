using Goleador.Domain.Common;
using Goleador.Domain.Enums;

namespace Goleador.Domain.Entities;

public class Match : BaseEntity
{
    public DateTime DatePlayed { get; private set; }
    public int ScoreHome { get; private set; }
    public int ScoreAway { get; private set; }

    // Per ora TableId lo teniamo semplice (nullable), senza relazione forte per non bloccarci
    public int? TableId { get; private set; }

    readonly List<MatchParticipant> _participants = [];
    public IReadOnlyCollection<MatchParticipant> Participants => _participants.AsReadOnly();

    Match() { } // Per EF Core

    public Match(int scoreHome, int scoreAway, int? tableId = null)
    {
        DatePlayed = DateTime.UtcNow;
        ScoreHome = scoreHome;
        ScoreAway = scoreAway;
        TableId = tableId;
    }

    // Metodo helper per aggiungere giocatori
    public void AddParticipant(Guid playerId, Side side) =>
        // Qui potremmo aggiungere controlli (es. max 2 giocatori per lato)
        _participants.Add(new MatchParticipant(playerId, side));
}
