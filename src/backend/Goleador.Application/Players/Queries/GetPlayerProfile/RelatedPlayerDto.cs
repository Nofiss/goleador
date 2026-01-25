namespace Goleador.Application.Players.Queries.GetPlayerProfile;

public class RelatedPlayerDto
{
    public Guid PlayerId { get; set; }
    public string Nickname { get; set; } = string.Empty;
    public int Count { get; set; }
}
