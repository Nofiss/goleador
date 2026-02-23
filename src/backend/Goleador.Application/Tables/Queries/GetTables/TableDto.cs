using AutoMapper;
using Goleador.Domain.Entities;

namespace Goleador.Application.Tables.Queries.GetTables;

public class TableDto
{
    public int Id { get; set; } // Nota: Table usa int come ID, non Guid
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool IsActive { get; set; }

    class Mapping : Profile
    {
        public Mapping() => CreateMap<Table, TableDto>();
    }
}
