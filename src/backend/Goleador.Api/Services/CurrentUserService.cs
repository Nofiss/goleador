using System.Security.Claims;
using Goleador.Application.Common.Interfaces;

namespace Goleador.Api.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public string? UserId =>
        httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
    // Nota: Assicurati che nel AuthController quando crei il token usi: new Claim(ClaimTypes.NameIdentifier, user.Id)
    // Se usavi "Jti", cambia ClaimTypes.NameIdentifier con JwtRegisteredClaimNames.Jti o adatta qui.
}
