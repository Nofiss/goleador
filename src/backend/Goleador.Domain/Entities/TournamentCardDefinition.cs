using Goleador.Domain.Common;
using Goleador.Domain.Enums;

namespace Goleador.Domain.Entities;

public class TournamentCardDefinition : BaseEntity
{
    public Guid TournamentId { get; private set; }
    public Tournament? Tournament { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public CardEffect Effect { get; private set; }

    TournamentCardDefinition() { }

    public TournamentCardDefinition(Guid tournamentId, string name, string description, CardEffect effect)
    {
        TournamentId = tournamentId;
        Name = name;
        Description = description;
        Effect = effect;
    }
}
