namespace Goleador.Application.Users.Queries.GetUsers;

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = [];
    public Guid? PlayerId { get; set; }
    public string? PlayerName { get; set; }
}
