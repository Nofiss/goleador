# ⚽ Goleador

**Goleador** è la piattaforma aziendale definitiva per la gestione, il tracciamento e l'organizzazione delle sfide di biliardino (calcio balilla).

Nato come tool interno, il progetto mira a digitalizzare il classico "foglio carta e penna" appeso in sala relax, introducendo storicità dei dati, classifiche automatiche e una gestione strutturata dei tornei per fomentare una sana competizione tra colleghi.

## 🚀 Panoramica del Progetto

L'applicazione è strutturata come un **Monorepo** che ospita:

- **Backend:** .NET 10 (Web API) sviluppato con Clean Architecture.
- **Frontend:** React (Vite + TypeScript) per una UI reattiva e veloce.
- **Database:** Astrazione tramite Entity Framework Core per supportare molteplici provider (SQL Server, PostgreSQL, SQLite).

## ✨ Funzionalità Principali

### 👥 Gestione Giocatori & Profili

- Creazione e gestione dei profili utente (Colleghi).
- Storico personale delle partite giocate.
- **Statistiche avanzate:** Win Rate, Goal fatti/subiti e trend di rendimento.

### 🏆 Tornei & Competizioni

- **Creazione Tornei:** Supporto per diverse modalità (es. Eliminazione diretta, Girone all'italiana).
- **Matchmaking:** Generazione automatica del calendario delle partite.
- **Bracket View:** Visualizzazione grafica del tabellone del torneo.

### ⚔️ Partite & Punteggi

- **Quick Match:** Registrazione rapida di una partita amichevole "al volo".
- **Match Programmati:** Svolgimento di partite previste da un torneo attivo.
- **Validazione:** Workflow di conferma risultato (es. inserito da un team, confermato dall'altro).

### 📊 Classifiche (Leaderboards)

- Classifiche globali e per torneo.
- Sistema di ranking (es. ELO o a punti) per determinare il "Re del Biliardino" in azienda.

## 🛠 Tech Stack

| Area | Tecnologia |
| :--- | :--- |
| **Backend** | .NET 10, C#, Entity Framework Core |
| **Frontend** | React, TypeScript, Vite, TailwindCSS (opzionale) |
| **Database** | Agnostico (Default: PostgreSQL/SQL Server) via EF Core |
| **Container** | Docker & Docker Compose |
| **CI/CD** | GitHub Actions |

## 🏁 Per Iniziare (Quick Start)

### Prerequisiti

Assicurati di avere installato sulla tua macchina:

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v20+ raccomandato)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Esecuzione in Locale

1. **Clona il repository:**

   ```bash
   git clone https://github.com/tuo-user/goleador.git
   cd goleador
   ```

2. **Avvia l'infrastruttura (Database):**

   ```bash
   cd infrastructure
   docker-compose up -d
   ```

3. **Backend:**

   ```bash
   cd src/backend
   dotnet restore
   dotnet run --project MyProject.Api
   ```

4. **Frontend:**

   ```bash
   cd src/frontend
   npm install
   npm run dev
   ```

## 📂 Struttura del Repository

```text
/docs            # Documentazione di progetto
/infrastructure  # Configurazioni Docker
/src/backend     # API .NET (Clean Architecture)
/src/frontend    # React App
```
