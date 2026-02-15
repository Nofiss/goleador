using Goleador.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goleador.Infrastructure.Persistence.Configurations;

public class TournamentCardDefinitionConfiguration : IEntityTypeConfiguration<TournamentCardDefinition>
{
    public void Configure(EntityTypeBuilder<TournamentCardDefinition> builder)
    {
        builder.HasKey(tcd => tcd.Id);

        builder.Property(tcd => tcd.Name).IsRequired().HasMaxLength(100);
        builder.Property(tcd => tcd.Description).HasMaxLength(500);

        builder.HasOne(tcd => tcd.Tournament)
            .WithMany(t => t.CardDefinitions)
            .HasForeignKey(tcd => tcd.TournamentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(tcd => !tcd.IsDeleted);
    }
}
