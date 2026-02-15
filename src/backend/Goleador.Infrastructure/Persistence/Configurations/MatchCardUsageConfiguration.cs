using Goleador.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goleador.Infrastructure.Persistence.Configurations;

public class MatchCardUsageConfiguration : IEntityTypeConfiguration<MatchCardUsage>
{
    public void Configure(EntityTypeBuilder<MatchCardUsage> builder)
    {
        builder.HasKey(mcu => mcu.Id);

        builder.HasOne(mcu => mcu.Match)
            .WithMany(m => m.CardUsages)
            .HasForeignKey(mcu => mcu.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(mcu => mcu.Team)
            .WithMany()
            .HasForeignKey(mcu => mcu.TeamId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(mcu => mcu.CardDefinition)
            .WithMany()
            .HasForeignKey(mcu => mcu.CardDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(mcu => !mcu.IsDeleted);
    }
}
