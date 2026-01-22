using Goleador.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Goleador.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Player> Players { get; }
    DbSet<Match> Matches { get; }
    DbSet<Tournament> Tournaments { get; }
    DbSet<TournamentTeam> TournamentTeams { get; }
    DbSet<Table> Tables { get; }

    EntityEntry<TEntity> Entry<TEntity>(TEntity entity) where TEntity : class;

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
