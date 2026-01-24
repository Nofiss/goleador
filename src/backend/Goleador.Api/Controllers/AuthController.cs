using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Goleador.Application.Auth.Commands.ForgotPassword;
using Goleador.Application.Auth.Commands.Register;
using Goleador.Application.Auth.Commands.RegisterUser;
using Goleador.Application.Auth.Commands.ResetPassword;
using Goleador.Application.Common.Interfaces;
using Goleador.Application.Common.Models;
using Goleador.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;

namespace Goleador.Api.Controllers;

[EnableRateLimiting("AuthPolicy")]
public class AuthController(IIdentityService identityService) : ApiControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var result = await identityService.LoginAsync(model.Email, model.Password);
        if (result != null)
        {
            return Ok(
                new
                {
                    token = result.AccessToken,
                    refreshToken = result.RefreshToken,
                    roles = result.Roles,
                }
            );
        }
        return Unauthorized();
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var result = await identityService.RefreshTokenAsync(
            request.AccessToken,
            request.RefreshToken
        );
        if (result != null)
        {
            return Ok(
                new
                {
                    token = result.AccessToken,
                    refreshToken = result.RefreshToken,
                    roles = result.Roles,
                }
            );
        }
        return BadRequest("Invalid token or refresh token.");
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
