using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Goleador.Application.Common.Interfaces;
using Goleador.Application.Common.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Goleador.Infrastructure.Identity;

public class IdentityService(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    : IIdentityService
{
    public async Task<TokenResponse?> LoginAsync(string email, string password)
    {
        ApplicationUser? user = await userManager.FindByEmailAsync(email);
        // Security: Prevent authentication for deleted accounts and avoid account enumeration.
        if (user == null || user.IsDeleted)
        {
            return null;
        }

        // Security: Check if account is locked out to prevent brute-force attacks (Defense in Depth).
        if (await userManager.IsLockedOutAsync(user))
        {
            return null;
        }

        if (await userManager.CheckPasswordAsync(user, password))
        {
            // Reset failed attempt counter on success
            await userManager.ResetAccessFailedCountAsync(user);

            IList<string> userRoles = await userManager.GetRolesAsync(user);
            JwtSecurityToken accessToken = CreateToken(user, userRoles);
            string refreshToken = GenerateRefreshToken();

            // Store the hashed refresh token in the database (Defense in Depth)
            user.RefreshToken = HashToken(refreshToken);
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await userManager.UpdateAsync(user);

            return new TokenResponse(
                new JwtSecurityTokenHandler().WriteToken(accessToken),
                refreshToken, // Return the plaintext token to the client
                userRoles.ToArray()
            );
        }

        // Increment failed attempt counter on failure
        await userManager.AccessFailedAsync(user);

        return null;
    }

    public async Task<TokenResponse?> RefreshTokenAsync(string accessToken, string refreshToken)
    {
        ClaimsPrincipal? principal = GetPrincipalFromExpiredToken(accessToken);
        if (principal == null)
        {
            return null;
        }

        string? userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return null;
        }

        ApplicationUser? user = await userManager.FindByIdAsync(userId);

        // Security: Invalidate refresh token renewal if user is deleted or locked out.
        // This ensures that administrative actions (lockout/deletion) take effect immediately upon next refresh.
        if (
            user == null
            || user.IsDeleted
            || await userManager.IsLockedOutAsync(user)
            || user.RefreshToken != HashToken(refreshToken)
            || user.RefreshTokenExpiryTime <= DateTime.UtcNow
        )
        {
            return null;
        }

        IList<string> userRoles = await userManager.GetRolesAsync(user);
        JwtSecurityToken newAccessToken = CreateToken(user, userRoles);
        string newRefreshToken = GenerateRefreshToken();

        // Rotate and hash the new refresh token
        user.RefreshToken = HashToken(newRefreshToken);
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await userManager.UpdateAsync(user);

        return new TokenResponse(
            new JwtSecurityTokenHandler().WriteToken(newAccessToken),
            newRefreshToken,
            userRoles.ToArray()
        );
    }

    private JwtSecurityToken CreateToken(ApplicationUser user, IList<string> roles)
    {
        var authClaims = new List<Claim>
        {
            new(ClaimTypes.Name, user.UserName!),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        foreach (string role in roles)
        {
            authClaims.Add(new Claim(ClaimTypes.Role, role));
        }

        var authSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!)
        );

        return new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            expires: DateTime.UtcNow.AddMinutes(15),
            claims: authClaims,
            signingCredentials: new SigningCredentials(
                authSigningKey,
                SecurityAlgorithms.HmacSha256
            )
        );
    }

    private static string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }

    /// <summary>
    /// Hashes a token string using SHA256.
    /// Used for "Defense in Depth" to protect refresh tokens stored in the database.
    /// </summary>
    private static string HashToken(string token)
    {
        if (string.IsNullOrEmpty(token))
        {
            return string.Empty;
        }

        var hashedBytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(hashedBytes);
    }

    private ClaimsPrincipal? GetPrincipalFromExpiredToken(string? token)
    {
        if (string.IsNullOrEmpty(token))
        {
            return null;
        }

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = configuration["Jwt:Issuer"],
            ValidAudience = configuration["Jwt:Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!)
            ),
            ValidateLifetime = false,
        };

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            ClaimsPrincipal principal = tokenHandler.ValidateToken(
                token,
                tokenValidationParameters,
                out SecurityToken securityToken
            );

            if (
                securityToken is not JwtSecurityToken jwtSecurityToken
                || !jwtSecurityToken.Header.Alg.Equals(
                    SecurityAlgorithms.HmacSha256,
                    StringComparison.InvariantCultureIgnoreCase
                )
            )
            {
                return null;
            }

            return principal;
        }
        catch
        {
            // Fail gracefully if token is malformed or invalid
            return null;
        }
    }

    public async Task<bool> ExistsByUsernameAsync(string username)
    {
        ApplicationUser? user = await userManager.FindByNameAsync(username);
        return user != null;
    }

    public async Task<(bool Success, string UserId, string[] Errors)> CreateUserAsync(
        string email,
        string username,
        string password
    )
    {
        var user = new ApplicationUser { UserName = username, Email = email };

        IdentityResult result = await userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            return (false, string.Empty, result.Errors.Select(e => e.Description).ToArray());
        }

        // Assegna ruolo default (es. "User" o niente, a seconda delle policy)
        await userManager.AddToRoleAsync(user, "Player");

        return (true, user.Id, Array.Empty<string>());
    }

    public async Task<(bool Success, string UserId, string[] Errors)> CreateUserByAdminAsync(
        string email,
        string username,
        string password
    )
    {
        var user = new ApplicationUser { UserName = username, Email = email };

        IdentityResult result = await userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            return (false, string.Empty, result.Errors.Select(e => e.Description).ToArray());
        }

        // Assegna ruolo default
        await userManager.AddToRoleAsync(user, "Player");

        return (true, user.Id, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> UpdateUserDetailsAsync(
        string userId,
        string email,
        string username
    )
    {
        ApplicationUser? user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return (false, ["User not found"]);
        }

        user.Email = email;
        user.UserName = username;

        // Identity normalize Automatically on UpdateAsync usually,
        // but manually setting them to be sure or using SetEmailAsync/SetUserNameAsync
        // For simplicity and consistency with existing code, we use UpdateAsync.
        // We ensure normalization is triggered by calling internal methods if needed or just trust UpdateAsync.

        IdentityResult result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return (false, result.Errors.Select(e => e.Description).ToArray());
        }

        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> DeleteUserAsync(string userId)
    {
        ApplicationUser? user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return (false, ["User not found"]);
        }

        IdentityResult result = await userManager.DeleteAsync(user);

        if (!result.Succeeded)
        {
            return (false, result.Errors.Select(e => e.Description).ToArray());
        }

        return (true, Array.Empty<string>());
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
