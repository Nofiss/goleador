using Goleador.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goleador.Infrastructure.Persistence.Configurations;

public class TournamentTeamConfiguration : IEntityTypeConfiguration<TournamentTeam>
{
    public void Configure(EntityTypeBuilder<TournamentTeam> builder)
    {
        builder.HasKey(tt => tt.Id);
        builder.Property(tt => tt.Name).HasMaxLength(50);

        // Relazione Many-to-Many tra TournamentTeam e Players
        // EF Core crea automaticamente una tabella ponte nascosta "TournamentTeamPlayers"
        builder.HasMany(tt => tt.Players).WithMany();
    }
}
