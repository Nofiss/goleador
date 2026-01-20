using Goleador.Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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

    public async Task<
        List<(string Id, string Email, string Username, string[] Roles)>
    > GetAllUsersAsync()
    {
        List<ApplicationUser> users = await userManager.Users.ToListAsync();
        var result = new List<(string, string, string, string[])>();

        foreach (ApplicationUser user in users)
        {
            IList<string> roles = await userManager.GetRolesAsync(user);
            result.Add((user.Id, user.Email!, user.UserName!, roles.ToArray()));
        }

        return result;
    }

    public async Task<(bool Success, string[] Errors)> UpdateUserRolesAsync(
        string userId,
        string[] newRoles
    )
    {
        ApplicationUser? user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return (false, new[] { "User not found" });
        }

        IList<string> currentRoles = await userManager.GetRolesAsync(user);

        var rolesToAdd = newRoles.Except(currentRoles).ToList();
        var rolesToRemove = currentRoles.Except(newRoles).ToList();

        // Transaction implicita se usiamo lo stesso DbContext, ma qui sono chiamate separate.
        // Se una fallisce l'altra potrebbe rimanere. Per ora accettiamo il rischio o usiamo TransactionScope.

        if (rolesToAdd.Count != 0)
        {
            IdentityResult addResult = await userManager.AddToRolesAsync(user, rolesToAdd);
            if (!addResult.Succeeded)
            {
                return (false, addResult.Errors.Select(e => e.Description).ToArray());
            }
        }

        if (rolesToRemove.Count != 0)
        {
            IdentityResult removeResult = await userManager.RemoveFromRolesAsync(
                user,
                rolesToRemove
            );
            if (!removeResult.Succeeded)
            {
                return (false, removeResult.Errors.Select(e => e.Description).ToArray());
            }
        }

        return (true, Array.Empty<string>());
    }

    public async Task<string?> GeneratePasswordResetTokenAsync(string email)
    {
        ApplicationUser? user = await userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return null;
        }

        return await userManager.GeneratePasswordResetTokenAsync(user);
    }

    public async Task<(bool Success, string[] Errors)> ResetPasswordAsync(
        string email,
        string token,
        string newPassword
    )
    {
        ApplicationUser? user = await userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return (false, new[] { "Invalid request." });
        }

        IdentityResult result = await userManager.ResetPasswordAsync(user, token, newPassword);

        if (!result.Succeeded)
        {
            return (false, result.Errors.Select(e => e.Description).ToArray());
        }

        return (true, Array.Empty<string>());
    }
}
