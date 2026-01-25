using Goleador.Application.Common.Models;

namespace Goleador.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<TokenResponse?> LoginAsync(string email, string password);

    Task<TokenResponse?> RefreshTokenAsync(string accessToken, string refreshToken);

    Task<bool> ExistsByUsernameAsync(string username);

    Task<(bool Success, string UserId, string[] Errors)> CreateUserAsync(
        string email,
        string username,
        string password
    );

    Task<(bool Success, string UserId, string[] Errors)> CreateUserByAdminAsync(
        string email,
        string username,
        string password
    );

    Task<(bool Success, string[] Errors)> UpdateUserDetailsAsync(
        string userId,
        string email,
        string username
    );

    Task<(bool Success, string[] Errors)> DeleteUserAsync(string userId);

    Task<List<(string Id, string Email, string Username, string[] Roles)>> GetAllUsersAsync();
    Task<(bool Success, string[] Errors)> UpdateUserRolesAsync(string userId, string[] newRoles);
    Task<string?> GeneratePasswordResetTokenAsync(string email);
    Task<(bool Success, string[] Errors)> ResetPasswordAsync(
        string email,
        string token,
        string newPassword
    );
}
