namespace Goleador.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<(bool Success, string UserId, string[] Errors)> CreateUserAsync(
        string email,
        string password
    );
}
