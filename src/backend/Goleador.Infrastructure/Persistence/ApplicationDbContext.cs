using System.Reflection;
using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options), IApplicationDbContext
{
    public DbSet<Player> Players { get; set; }
    public DbSet<Match> Matches { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Questo comando magico scansiona l'assembly corrente (Infrastructure)
        // e applica tutte le configurazioni che implementano IEntityTypeConfiguration (come PlayerConfiguration).
        // Così non dobbiamo aggiungerle una per una manualmente.
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        base.OnModelCreating(modelBuilder);
    }
}
