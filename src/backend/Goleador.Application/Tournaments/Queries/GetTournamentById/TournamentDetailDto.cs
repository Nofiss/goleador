using AutoMapper;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;
using Goleador.Domain.ValueObjects;

namespace Goleador.Application.Tournaments.Queries.GetTournamentById;

public class TournamentDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public TournamentStatus Status { get; set; }
    public TournamentType Type { get; set; }
    public int TeamSize { get; set; }
    public string? Notes { get; set; }
    public ScoringRulesDto ScoringRules { get; set; } = new();

    // Relazioni
    public List<TeamDto> Teams { get; set; } = [];
    public List<TournamentMatchDto> Matches { get; set; } = [];

    class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Tournament, TournamentDetailDto>();
            CreateMap<TournamentTeam, TeamDto>();
            CreateMap<Match, TournamentMatchDto>()
                // Mappiamo i nomi dei partecipanti per visualizzarli facilmente
                .ForMember(d => d.HomeTeamName, opt => opt.MapFrom(s => GetTeamName(s, Side.Home)))
                .ForMember(d => d.AwayTeamName, opt => opt.MapFrom(s => GetTeamName(s, Side.Away)));
            CreateMap<TournamentScoringRules, ScoringRulesDto>();
        }

        // Helper per estrarre i nomi (logica un po' complessa da fare in AutoMapper puro, semplifichiamo)
        // Nota: Nel dominio non abbiamo il concetto di "Nome Team" dentro il Match, ma solo Player.
        // Per semplicità qui mappiamo solo gli ID e Punteggi, il frontend risolverà i nomi o faremo una query più furba in futuro.
        static string GetTeamName(Match match, Side side) => "Team " + side; // Placeholder
    }
}

public class TeamDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class TournamentMatchDto
{
    public Guid Id { get; set; }
    public int ScoreHome { get; set; }
    public int ScoreAway { get; set; }
    public MatchStatus Status { get; set; }
    public string HomeTeamName { get; set; } = string.Empty;
    public string AwayTeamName { get; set; } = string.Empty;
}

public class ScoringRulesDto
{
    public int PointsForWin { get; set; }
    public int PointsForDraw { get; set; }
    public int PointsForLoss { get; set; }
    public int? GoalThreshold { get; set; }
    public int GoalThresholdBonus { get; set; }
    public bool EnableTenZeroBonus { get; set; }
    public int TenZeroBonus { get; set; }
}
