using Goleador.Application.Auth.Commands.ForgotPassword;
using Goleador.Application.Auth.Commands.RegisterUser;
using Goleador.Application.Auth.Commands.ResetPassword;
using Goleador.Application.Common.Interfaces;
using Goleador.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Goleador.Api.Controllers;

[EnableRateLimiting("AuthPolicy")]
public class AuthController(IIdentityService identityService) : ApiControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        TokenResponse? result = await identityService.LoginAsync(model.Email, model.Password);
        return result != null
            ? Ok(
                new
                {
                    token = result.AccessToken,
                    refreshToken = result.RefreshToken,
                    roles = result.Roles,
                }
            )
            : Unauthorized();
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        TokenResponse? result = await identityService.RefreshTokenAsync(
            request.AccessToken,
            request.RefreshToken
        );
        return result != null
            ? Ok(
                new
                {
                    token = result.AccessToken,
                    refreshToken = result.RefreshToken,
                    roles = result.Roles,
                }
            )
            : BadRequest("Invalid token or refresh token.");
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserCommand command)
    {
        await Mediator.Send(command);
        return Ok(new { message = "Registrazione completata! Ora puoi fare login." });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        await Mediator.Send(new ForgotPasswordCommand(request.Email));
        return Ok(new { message = "Se l'email esiste, riceverai un link di reset." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        await Mediator.Send(command);
        return Ok(new { message = "Password aggiornata con successo." });
    }
}
