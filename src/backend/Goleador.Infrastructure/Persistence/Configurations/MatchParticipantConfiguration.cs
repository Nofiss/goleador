using Goleador.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goleador.Infrastructure.Persistence.Configurations;

public class MatchParticipantConfiguration : IEntityTypeConfiguration<MatchParticipant>
{
    public void Configure(EntityTypeBuilder<MatchParticipant> builder)
    {
        // Chiave Primaria Composta (MatchId + PlayerId)
        builder.HasKey(mp => new { mp.MatchId, mp.PlayerId });

        builder
            .HasOne(mp => mp.Player)
            .WithMany()
            .HasForeignKey(mp => mp.PlayerId)
            .OnDelete(DeleteBehavior.Restrict); // Non cancellare il giocatore se cancello la partecipazione

        builder.HasQueryFilter(mp => !mp.Match.IsDeleted);
    }
}
