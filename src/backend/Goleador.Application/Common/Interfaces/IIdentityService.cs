namespace Goleador.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<(bool Success, string UserId, string[] Errors)> CreateUserAsync(
        string email,
        string password
    );
    Task<List<(string Id, string Email, string Username, string[] Roles)>> GetAllUsersAsync();
    Task<(bool Success, string[] Errors)> UpdateUserRolesAsync(string userId, string[] newRoles);
    Task<string?> GeneratePasswordResetTokenAsync(string email);
    Task<(bool Success, string[] Errors)> ResetPasswordAsync(
        string email,
        string token,
        string newPassword
    );
}
