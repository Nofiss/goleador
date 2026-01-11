using AutoMapper;
using Goleador.Domain.Entities;
using Goleador.Domain.Enums;

namespace Goleador.Application.Tournaments.Queries.GetTournaments;

public class TournamentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public TournamentType Type { get; set; }
    public TournamentStatus Status { get; set; }
    public int TeamSize { get; set; }
    public bool HasReturnMatches { get; set; }

    class Mapping : Profile
    {
        public Mapping() => CreateMap<Tournament, TournamentDto>();
    }
}
