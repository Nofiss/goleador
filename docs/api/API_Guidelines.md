# 📡 API Design Guidelines

Questo documento definisce gli standard per la comunicazione tra Frontend (React) e Backend (.NET API).

## 1. Principi Generali

- **Protocollo:** REST su HTTPS.
- **Formato Dati:** JSON (`application/json`).
- **Encoding:** UTF-8.

## 2. Naming Conventions

| Ambito | Convenzione | Esempio |
| :--- | :--- | :--- |
| **URL (Endpoints)** | kebab-case (plurale) | `/api/matches`, `/api/tournament-rankings` |
| **Query Params** | camelCase | `?startDate=2023-01-01&page=1` |
| **JSON Properties** | **camelCase** | `{ "firstName": "Mario", "isCaptain": true }` |
| **C# Properties** | PascalCase | `public string FirstName { get; set; }` |

> **Nota per il Backend:** .NET 10 converte automaticamente PascalCase (C#) in camelCase (JSON). Non forzare nomi diversi con attributi `[JsonPropertyName]` a meno di casi eccezionali.

## 3. Tipi di Dato

### 📅 Date e Orari

Le date devono essere **SEMPRE** scambiate in formato **ISO 8601 UTC**.

- **Formato:** `YYYY-MM-DDTHH:mm:ssZ`
- **Esempio:** `2023-10-25T14:30:00Z`
- Il frontend si occuperà di convertire l'orario nel fuso locale dell'utente per la visualizzazione.

### 🆔 Identificatori (ID)

Gli ID sono **GUID/UUID**.

- In JSON vengono passati come stringhe.
- Esempio: `"3fa85f64-5717-4562-b3fc-2c963f66afa6"`

### 🔠 Enumeratori (Enums)

Gli Enum vengono serializzati come **Stringhe**, non come interi. Questo migliora la leggibilità del network log e del codice frontend.

- **Sì:** `{ "status": "Finished" }`
- **No:** `{ "status": 2 }`

## 4. Metodi HTTP

| Verbo | Utilizzo | Body Richiesto? |
| :--- | :--- | :--- |
| **GET** | Recupero risorse. Idempotente. | No |
| **POST** | Creazione risorse o esecuzione comandi complessi. | Sì |
| **PUT** | Aggiornamento completo di una risorsa (sostituzione). | Sì |
| **PATCH** | Aggiornamento parziale (es. cambiare solo lo stato). | Sì |
| **DELETE** | Rimozione risorsa. | No |

## 5. Risposte e Status Code

### ✅ Successo

- **200 OK:** La richiesta è andata a buon fine. Ritorna il dato richiesto (oggetto o array).
- **201 Created:** Risorsa creata con successo (es. dopo una POST).
- **204 No Content:** Azione eseguita, nessun dato da restituire (spesso usato per DELETE o PUT).

**Formato Response Successo:**
Evitare "wrapper" inutili tipo `{ "data": ... }`. Restituire direttamente la risorsa.

```json
// GET /players/1
{
  "id": "...",
  "nickname": "IlBomber",
  "email": "..."
}
```

### ❌ Errori (ProblemDetails)

In caso di errore (4xx o 5xx), l'API restituisce un oggetto standard **ProblemDetails** (RFC 7807).

- **400 Bad Request:** Validazione fallita o richiesta malformata.
- **401 Unauthorized:** Manca il token o è scaduto.
- **403 Forbidden:** L'utente è autenticato ma non ha i permessi.
- **404 Not Found:** Risorsa inesistente.
- **500 Internal Server Error:** Bug non gestito nel backend.

**Esempio Response Errore 400 (Validazione):**

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Email": [
      "The Email field is not a valid e-mail address."
    ],
    "Nickname": [
      "Nickname must be unique."
    ]
  }
}
```

## 6. Paginazione

Per endpoint che restituiscono liste lunghe (es. storico partite), usare la paginazione tramite query string.

**Request:**
`GET /matches?pageNumber=1&pageSize=20`

**Response (PagedResult):**

```json
{
  "items": [ ... ],
  "pageNumber": 1,
  "totalPages": 5,
  "totalCount": 98,
  "hasNextPage": true
}
```
