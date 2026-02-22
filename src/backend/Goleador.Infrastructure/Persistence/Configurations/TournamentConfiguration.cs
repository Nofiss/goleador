using Goleador.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goleador.Infrastructure.Persistence.Configurations;

public class TournamentConfiguration : IEntityTypeConfiguration<Tournament>
{
    public void Configure(EntityTypeBuilder<Tournament> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).IsRequired().HasMaxLength(100);
        builder.Property(t => t.Rules).HasMaxLength(4000); // Max 4000 caratteri per Markdown

        // Relazione con le squadre: Se cancello il torneo, cancello le iscrizioni
        builder
            .HasMany(t => t.Teams)
            .WithOne(team => team.Tournament)
            .HasForeignKey(team => team.TournamentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relazione con le partite: Se cancello il torneo, cancello le partite (oppure no? Cascade è comodo in dev)
        builder
            .HasMany(t => t.Matches)
            .WithOne(m => m.Tournament)
            .HasForeignKey(m => m.TournamentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configurazione Owned Type (ScoringRules)
        builder.OwnsOne(t => t.ScoringRules, scoring =>
        {
            scoring.Property(s => s.PointsForWin).HasDefaultValue(3);
            scoring.Property(s => s.PointsForDraw).HasDefaultValue(1);
            scoring.Property(s => s.PointsForLoss).HasDefaultValue(0);
        });
    }
}
