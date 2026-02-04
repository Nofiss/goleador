using System.Text.Json;
using Goleador.Application.Common.Interfaces;
using Goleador.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Goleador.Infrastructure.Persistence.Interceptors;

public class AuditLogInterceptor(ICurrentUserService currentUserService) : SaveChangesInterceptor
{
    private List<AuditEntry>? _auditEntries;

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context == null) return await base.SavingChangesAsync(eventData, result, cancellationToken);

        _auditEntries = OnBeforeSaveChanges(eventData.Context);

        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context == null || _auditEntries == null || _auditEntries.Count == 0)
            return await base.SavedChangesAsync(eventData, result, cancellationToken);

        await OnAfterSaveChanges(eventData.Context, _auditEntries, cancellationToken);

        return await base.SavedChangesAsync(eventData, result, cancellationToken);
    }

    private List<AuditEntry> OnBeforeSaveChanges(DbContext context)
    {
        context.ChangeTracker.DetectChanges();
        var auditEntries = new List<AuditEntry>();

        foreach (var entry in context.ChangeTracker.Entries())
        {
            if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            var auditEntry = new AuditEntry(entry)
            {
                TableName = entry.Metadata.GetTableName() ?? entry.Metadata.Name,
                UserId = currentUserService.UserId,
                Type = entry.State switch
                {
                    EntityState.Added => "Create",
                    EntityState.Modified => "Update",
                    EntityState.Deleted => "Delete",
                    _ => entry.State.ToString()
                }
            };
            auditEntries.Add(auditEntry);

            foreach (var property in entry.Properties)
            {
                if (property.IsTemporary)
                {
                    auditEntry.TemporaryProperties.Add(property);
                    continue;
                }

                string propertyName = property.Metadata.Name;
                if (property.Metadata.IsPrimaryKey())
                {
                    auditEntry.KeyValues[propertyName] = property.CurrentValue;
                    continue;
                }

                if (IsSensitive(propertyName))
                    continue;

                switch (entry.State)
                {
                    case EntityState.Added:
                        auditEntry.NewValues[propertyName] = property.CurrentValue;
                        break;

                    case EntityState.Deleted:
                        auditEntry.OldValues[propertyName] = property.OriginalValue;
                        break;

                    case EntityState.Modified:
                        if (property.IsModified)
                        {
                            auditEntry.ChangedColumns.Add(propertyName);
                            auditEntry.OldValues[propertyName] = property.OriginalValue;
                            auditEntry.NewValues[propertyName] = property.CurrentValue;
                        }
                        break;
                }
            }
        }

        foreach (var auditEntry in auditEntries.Where(_ => !_.HasTemporaryProperties))
        {
            context.Set<AuditLog>().Add(auditEntry.ToAudit());
        }

        return auditEntries.Where(_ => _.HasTemporaryProperties).ToList();
    }

    private static bool IsSensitive(string propertyName) =>
        propertyName is "PasswordHash" or "SecurityStamp" or "RefreshToken" or "ConcurrencyStamp";

    private async Task OnAfterSaveChanges(DbContext context, List<AuditEntry> auditEntries, CancellationToken cancellationToken)
    {
        foreach (var auditEntry in auditEntries)
        {
            foreach (var prop in auditEntry.TemporaryProperties)
            {
                if (prop.Metadata.IsPrimaryKey())
                {
                    auditEntry.KeyValues[prop.Metadata.Name] = prop.CurrentValue;
                }
                else
                {
                    auditEntry.NewValues[prop.Metadata.Name] = prop.CurrentValue;
                }
            }
            context.Set<AuditLog>().Add(auditEntry.ToAudit());
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}

internal class AuditEntry(EntityEntry entry)
{
    public EntityEntry Entry { get; } = entry;
    public string? UserId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Dictionary<string, object?> KeyValues { get; } = new();
    public Dictionary<string, object?> OldValues { get; } = new();
    public Dictionary<string, object?> NewValues { get; } = new();
    public List<PropertyEntry> TemporaryProperties { get; } = new();
    public List<string> ChangedColumns { get; } = new();

    public bool HasTemporaryProperties => TemporaryProperties.Any();

    public AuditLog ToAudit()
    {
        var audit = new AuditLog
        {
            UserId = UserId,
            Type = Type,
            TableName = TableName,
            DateTime = DateTime.UtcNow,
            PrimaryKey = KeyValues.Count == 1 ? KeyValues.Values.First()?.ToString() ?? string.Empty : JsonSerializer.Serialize(KeyValues),
            OldValues = OldValues.Count == 0 ? null : JsonSerializer.Serialize(OldValues),
            NewValues = NewValues.Count == 0 ? null : JsonSerializer.Serialize(NewValues),
            AffectedColumns = ChangedColumns.Count == 0 ? null : JsonSerializer.Serialize(ChangedColumns)
        };
        return audit;
    }
}
