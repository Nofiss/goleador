using Azure.Identity;
using Goleador.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Graph.Users.Item.SendMail;

namespace Goleador.Infrastructure.Services;

public class GraphEmailService : IEmailService
{
    readonly IConfiguration _configuration;
    readonly ILogger<GraphEmailService> _logger;
    readonly GraphServiceClient _graphClient;
    readonly string _senderEmail;

    public GraphEmailService(IConfiguration configuration, ILogger<GraphEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        // Recuperiamo le configurazioni
        var tenantId = _configuration["AzureAd:TenantId"];
        var clientId = _configuration["AzureAd:ClientId"];
        var clientSecret = _configuration["AzureAd:ClientSecret"];
        _senderEmail = _configuration["AzureAd:SenderEmail"]!;

        if (
            string.IsNullOrWhiteSpace(tenantId)
            || string.IsNullOrWhiteSpace(clientId)
            || string.IsNullOrWhiteSpace(clientSecret)
        )
        {
            // csharpsquid:S112 - Using InvalidOperationException for configuration errors
            throw new InvalidOperationException("Configurazione AzureAd mancante in appsettings.json");
        }

        // Configurazione OAuth2 Client Credentials
        var options = new ClientSecretCredentialOptions
        {
            AuthorityHost = AzureAuthorityHosts.AzurePublicCloud,
        };

        var clientSecretCredential = new ClientSecretCredential(
            tenantId,
            clientId,
            clientSecret,
            options
        );

        // Inizializza il client Graph
        _graphClient = new GraphServiceClient(
            clientSecretCredential,
            ["https://graph.microsoft.com/.default"]
        );
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            var requestBody = new SendMailPostRequestBody
            {
                Message = new Message
                {
                    Subject = subject,
                    Body = new ItemBody
                    {
                        ContentType = BodyType.Html, // Supportiamo HTML per i link cliccabili
                        Content = body,
                    },
                    ToRecipients =
                    [
                        new Recipient { EmailAddress = new EmailAddress { Address = to } },
                    ],
                },
                SaveToSentItems = false,
            };

            // Invio della mail "a nome di" un utente specifico (SenderEmail)
            // Nota: L'App Registration deve avere i permessi Mail.Send
            await _graphClient.Users[_senderEmail].SendMail.PostAsync(requestBody);

            _logger.LogInformation($"Email inviata con successo a {to} tramite Graph API.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Errore durante l'invio email a {to}");
            throw;
        }
    }
}
