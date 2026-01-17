using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Goleador.Application.Auth.Commands.Register;
using Goleador.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace Goleador.Api.Controllers;

public class AuthController(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    : ApiControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        ApplicationUser? user = await userManager.FindByEmail(model.Email);
        if (user != null && await userManager.CheckPassword(user, model.Password))
        {
            IList<string> userRoles = await userManager.GetRoles(user);

            var authClaims = new List<Claim>
            {
                new(ClaimTypes.Name, user.UserName!),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            foreach (var role in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
            }

            var authSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!)
            );

            var token = new JwtSecurityToken(
                issuer: configuration["Jwt:Issuer"],
                audience: configuration["Jwt:Audience"],
                expires: DateTime.Now.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(
                    authSigningKey,
                    SecurityAlgorithms.HmacSha256
                )
            );

            return Ok(
                new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo,
                    roles = userRoles, // Restituiamo i ruoli al frontend
                }
            );
        }
        return Unauthorized();
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserCommand command)
    {
        await Mediator.Send(command);
        return Ok(new { message = "Registrazione completata! Ora puoi fare login." });
    }
}

public record LoginModel(string Email, string Password);
