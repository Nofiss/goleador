namespace Goleador.Application.Common.Exceptions;

public class ConcurrencyException : Exception
{
    public ConcurrencyException()
        : base("The record has been modified by another user.") { }

    public ConcurrencyException(string message)
        : base(message) { }

    public ConcurrencyException(string message, Exception innerException)
        : base(message, innerException) { }
}
