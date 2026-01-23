using Goleador.Domain.Common;
using Microsoft.AspNetCore.Identity;

namespace Goleador.Infrastructure.Identity;

public class ApplicationUser : IdentityUser, ISoftDelete
{
    // Qui puoi aggiungere proprietà custom es. "FullName"
    public string? RefreshToken { get; set; }
    public DateTime RefreshTokenExpiryTime { get; set; }
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}
