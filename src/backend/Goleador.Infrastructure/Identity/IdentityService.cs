using Goleador.Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Goleador.Infrastructure.Identity;

public class IdentityService(UserManager<ApplicationUser> userManager) : IIdentityService
{
    public async Task<(bool Success, string UserId, string[] Errors)> CreateUserAsync(
        string email,
        string password
    )
    {
        var user = new ApplicationUser { UserName = email, Email = email };

        IdentityResult result = await userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            return (false, string.Empty, result.Errors.Select(e => e.Description).ToArray());
        }

        // Assegna ruolo default (es. "User" o niente, a seconda delle policy)
        await userManager.AddToRoleAsync(user, "Player");

        return (true, user.Id, Array.Empty<string>());
    }
}
