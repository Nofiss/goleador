using System.Reflection;
using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Goleador.Infrastructure.Identity;
using Goleador.Infrastructure.Persistence.Extensions;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Goleador.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<ApplicationUser>(options), IApplicationDbContext
{
    public DbSet<Player> Players { get; set; }
    public DbSet<Match> Matches { get; set; }
    public DbSet<Tournament> Tournaments { get; set; }
    public DbSet<TournamentTeam> TournamentTeams { get; set; }
    public DbSet<TournamentCardDefinition> TournamentCardDefinitions { get; set; }
    public DbSet<MatchCardUsage> MatchCardUsages { get; set; }
    public DbSet<Table> Tables { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Questo comando magico scansiona l'assembly corrente (Infrastructure)
        // e applica tutte le configurazioni che implementano IEntityTypeConfiguration (come PlayerConfiguration).
        // Così non dobbiamo aggiungerle una per una manualmente.
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        modelBuilder.ApplySoftDeleteQueryFilter();

        base.OnModelCreating(modelBuilder);
    }
}
