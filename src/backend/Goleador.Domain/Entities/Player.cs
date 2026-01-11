using Goleador.Domain.Common;

namespace Goleador.Domain.Entities;

public class Player : BaseEntity
{
    public string Nickname { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string Email { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // Costruttore vuoto richiesto da EF Core per la reflection
    private Player()
    {
        Nickname = string.Empty;
        FirstName = string.Empty;
        LastName = string.Empty;
        Email = string.Empty;
    }

    public Player(string nickname, string firstName, string lastName, string email)
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
}
