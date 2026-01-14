using System.Data;
using System.Text.Json;
using Azure.AI.OpenAI;
using Goleador.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using OpenAI.Chat;

namespace Goleador.Infrastructure.Services;

public class OpenAiTeamGeneratorService(IConfiguration config) : ITeamGeneratorService
{
    readonly string _apiKey = config["OpenAi:Key"] ?? "";

    public async Task<List<(Guid, Guid)>> GenerateBalancedTeamsAsync(
        Dictionary<Guid, double> playerSkills
    )
    {
        // 1. Costruiamo il prompt con i dati
        var playersListString = string.Join(
            "\n",
            playerSkills.Select(p => $"ID: {p.Key}, Skill: {p.Value:F1}")
        );

        var prompt =
            $@"
        Sei un organizzatore di tornei esperto. Devi creare squadre da 2 persone bilanciate.
        Ecco la lista dei giocatori con il loro livello di abilità (Skill Score):
        {playersListString}

        REGOLE:
        1. Accoppia i giocatori forti con quelli deboli per rendere la media delle squadre simile.
        2. Restituisci SOLO un array JSON di coppie di ID. Esempio: [[id1, id2], [id3, id4]].
        3. Se i giocatori sono dispari, lascia fuori l'ultimo (o crea un gruppo da 3 se preferisci, ma qui facciamo coppie).
        ";

        // 1. Inizializzazione del client (richiede Endpoint e Key)
        var azureClient = new AzureOpenAIClient(
            new Uri("https://centrosoftware.openai.azure.com/"),
            new System.ClientModel.ApiKeyCredential(_apiKey)
        );

        // 2. Ottenere il ChatClient specifico per il tuo deployment (modello)
        // Nota: Su Azure, il primo parametro è il "Deployment Name"
        ChatClient chatClient = azureClient.GetChatClient("gpt-5");

        // 3. Configurazione delle opzioni (JSON Mode)
        ChatCompletionOptions options = new()
        {
            ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat(),
        };

        // 4. Definizione dei messaggi
        var messages = new ChatMessage[]
        {
            new SystemChatMessage("Rispondi solo in JSON."),
            new UserChatMessage(prompt),
        };

        // 5. Esecuzione della chiamata
        ChatCompletion completion = await chatClient.CompleteChatAsync(messages, options);

        // 6. Estrazione del contenuto testuale
        var jsonContent = completion.Content[0].Text;

        // 7. Deserializzazione con System.Text.Json
        List<List<Guid>>? pairs = JsonSerializer.Deserialize<List<List<Guid>>>(jsonContent);

        return pairs?.Select(p => (p[0], p[1])).ToList() ?? [];
    }
}
