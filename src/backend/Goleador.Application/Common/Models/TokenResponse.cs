namespace Goleador.Application.Common.Models;

public record TokenResponse(string AccessToken, string RefreshToken, string[] Roles);
