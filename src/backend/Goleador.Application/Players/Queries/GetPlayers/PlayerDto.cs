using AutoMapper;
using Goleador.Domain.Entities;

namespace Goleador.Application.Players.Queries.GetPlayers;

public class PlayerDto
{
    public Guid Id { get; set; }
    public string Nickname { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty; // Campo calcolato
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Configurazione del Mapping (Entity -> DTO)
    class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Player, PlayerDto>()
                .ForMember(d => d.FullName, opt => opt.MapFrom(s => $"{s.FirstName} {s.LastName}"));
        }
    }
}
