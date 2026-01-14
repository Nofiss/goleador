namespace Goleador.Domain.Entities;

public class Table
{
    public int Id { get; set; } // PK
    public string Name { get; private set; } = string.Empty;
    public string Location { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

    // Costruttore privato per EF Core
    Table() { }

    public Table(string name, string location)
    {
        Name = name;
        Location = location;
        IsActive = true;
    }

    public void UpdateDetails(string name, string location)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Name cannot be empty");
        }

        Name = name;
        Location = location;
    }

    public void ToggleStatus(bool isActive) => IsActive = isActive;
}
