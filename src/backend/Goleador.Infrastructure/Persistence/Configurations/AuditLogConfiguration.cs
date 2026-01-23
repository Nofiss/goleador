using Goleador.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goleador.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.TableName)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(a => a.Type)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(a => a.OldValues)
            .IsUnicode(true);

        builder.Property(a => a.NewValues)
            .IsUnicode(true);

        builder.Property(a => a.PrimaryKey)
            .HasMaxLength(256)
            .IsRequired();
    }
}
