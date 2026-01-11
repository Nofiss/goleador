using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Goleador.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    // Recupera il Mediator dai servizi solo quando serve (Lazy loading)
    protected ISender Mediator =>
        field ??= HttpContext.RequestServices.GetRequiredService<ISender>();
}
