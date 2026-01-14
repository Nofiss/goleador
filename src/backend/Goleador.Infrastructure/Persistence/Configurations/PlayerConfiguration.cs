using Goleador.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goleador.Infrastructure.Persistence.Configurations;

public class PlayerConfiguration : IEntityTypeConfiguration<Player>
{
    public void Configure(EntityTypeBuilder<Player> builder)
    {
        // Primary Key
        builder.HasKey(p => p.Id);

        // Nickname: Obbligatorio, max 50 chars, UNIVOCI
        builder.Property(p => p.Nickname).IsRequired().HasMaxLength(50);

        builder.HasIndex(p => p.Nickname).IsUnique();
        builder.HasIndex(p => p.UserId).IsUnique();

        // Altri campi stringa con limiti sensati
        builder.Property(p => p.FirstName).IsRequired().HasMaxLength(100);

        builder.Property(p => p.LastName).IsRequired().HasMaxLength(100);

        builder.Property(p => p.Email).IsRequired().HasMaxLength(255);

        builder.Property(p => p.UserId).HasMaxLength(450);
    }
}
