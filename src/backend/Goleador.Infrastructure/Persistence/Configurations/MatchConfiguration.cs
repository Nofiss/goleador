using Goleador.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goleador.Infrastructure.Persistence.Configurations;

public class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.HasKey(m => m.Id);

        // Relazione 1-a-Molti con Participants
        builder
            .HasMany(m => m.Participants)
            .WithOne(p => p.Match)
            .HasForeignKey(p => p.MatchId)
            .OnDelete(DeleteBehavior.Cascade); // Se cancello la partita, cancello i partecipanti

        builder.Property(m => m.RowVersion).IsRowVersion();

        builder.HasIndex(m => m.TournamentId);
        builder.HasIndex(m => m.Status);
        builder.HasIndex(m => new { m.TournamentId, m.Status });

        builder.HasQueryFilter(m => !m.IsDeleted);
    }
}
