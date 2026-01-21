using MediatR;

namespace Goleador.Application.Common.Interfaces;

public interface ICacheableQuery<out TResponse> : IRequest<TResponse>
{
    string CacheKey { get; }
    TimeSpan? Expiration { get; }
}
