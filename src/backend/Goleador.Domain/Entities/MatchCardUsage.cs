using Goleador.Domain.Common;

namespace Goleador.Domain.Entities;

public class MatchCardUsage : BaseEntity
{
    public Guid MatchId { get; private set; }
    public Match? Match { get; private set; }
    public Guid TeamId { get; private set; }
    public TournamentTeam? Team { get; private set; }
    public Guid CardDefinitionId { get; private set; }
    public TournamentCardDefinition? CardDefinition { get; private set; }

    MatchCardUsage() { }

    public MatchCardUsage(Guid matchId, Guid teamId, Guid cardDefinitionId)
    {
        MatchId = matchId;
        TeamId = teamId;
        CardDefinitionId = cardDefinitionId;
    }
}
