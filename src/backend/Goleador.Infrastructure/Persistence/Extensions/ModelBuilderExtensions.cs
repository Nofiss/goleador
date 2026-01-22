using System.Linq.Expressions;
using Goleador.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Goleador.Infrastructure.Persistence.Extensions;

public static class ModelBuilderExtensions
{
    public static void ApplySoftDeleteQueryFilter(this ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ISoftDelete).IsAssignableFrom(entityType.ClrType))
            {
                entityType.AddSoftDeleteQueryFilter();
            }
        }
    }

    private static void AddSoftDeleteQueryFilter(this IMutableEntityType entityType)
    {
        var methodToCall = typeof(ModelBuilderExtensions)
            .GetMethod(nameof(GetSoftDeleteFilter), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)
            ?.MakeGenericMethod(entityType.ClrType);

        var filter = methodToCall?.Invoke(null, null);
        entityType.SetQueryFilter((LambdaExpression)filter!);
    }

    private static LambdaExpression GetSoftDeleteFilter<TEntity>() where TEntity : class, ISoftDelete
    {
        Expression<Func<TEntity, bool>> filter = x => !x.IsDeleted;
        return filter;
    }
}
