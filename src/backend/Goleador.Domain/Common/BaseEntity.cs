namespace Goleador.Domain.Common;

public abstract class BaseEntity : ISoftDelete
{
    public Guid Id { get; protected set; }
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }

    protected BaseEntity() => Id = Guid.NewGuid();
}
