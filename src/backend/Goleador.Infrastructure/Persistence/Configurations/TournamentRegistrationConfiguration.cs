using Goleador.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goleador.Infrastructure.Persistence.Configurations;

public class TournamentRegistrationConfiguration : IEntityTypeConfiguration<TournamentRegistration>
{
    public void Configure(EntityTypeBuilder<TournamentRegistration> builder)
    {
        // Chiave composta: Un giocatore può iscriversi una sola volta a un torneo
        builder.HasKey(tr => new { tr.TournamentId, tr.PlayerId });

        builder
            .HasOne(tr => tr.Tournament)
            .WithMany(t => t.Registrations)
            .HasForeignKey(tr => tr.TournamentId);

        builder.HasOne(tr => tr.Player).WithMany().HasForeignKey(tr => tr.PlayerId);

        builder.HasQueryFilter(tr => !tr.Player.IsDeleted);
    }
}
