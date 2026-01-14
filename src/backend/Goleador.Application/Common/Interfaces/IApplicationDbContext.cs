using Goleador.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Player> Players { get; }
    DbSet<Match> Matches { get; }
    DbSet<Tournament> Tournaments { get; }
    DbSet<TournamentTeam> TournamentTeams { get; }
    DbSet<Table> Tables { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
