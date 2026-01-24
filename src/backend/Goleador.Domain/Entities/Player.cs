using Goleador.Domain.Common;

namespace Goleador.Domain.Entities;

public class Player : BaseEntity
{
    public string Nickname { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public int EloRating { get; private set; } = 1200;
    public DateTime CreatedAt { get; private set; }

    public string? UserId { get; private set; }

    // Costruttore vuoto richiesto da EF Core per la reflection
    Player() { }

    public Player(
        string nickname,
        string firstName,
        string lastName,
        string email,
        string? userId = null
    )
    {
        // Qui potremmo mettere validazioni di dominio basilari (es. controlli null)
        // Ma per regole complesse useremo FluentValidation nell'Application Layer.

        if (string.IsNullOrWhiteSpace(nickname))
        {
            throw new ArgumentException("Nickname cannot be empty");
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email cannot be empty");
        }

        Nickname = nickname;
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        UserId = userId;
        CreatedAt = DateTime.UtcNow;
    }

    // Esempio di metodo di dominio per modificare lo stato
    public void UpdateEmail(string newEmail)
    {
        if (string.IsNullOrWhiteSpace(newEmail))
        {
            throw new ArgumentException("New email cannot be empty");
        }

        Email = newEmail;
    }

    public void UpdateDetails(string firstName, string lastName, string email)
    {
        if (string.IsNullOrWhiteSpace(firstName))
        {
            throw new ArgumentException("First name cannot be empty");
        }

        if (string.IsNullOrWhiteSpace(lastName))
        {
            throw new ArgumentException("Last name cannot be empty");
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email cannot be empty");
        }

        FirstName = firstName;
        LastName = lastName;
        Email = email;
    }

    public void SetUser(string userId) => UserId = userId;

    public void RemoveUserLink() => UserId = null;

    public void UpdateElo(int pointsChange)
    {
        EloRating += pointsChange;
    }
}
