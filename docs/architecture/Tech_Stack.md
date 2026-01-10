# 🛠 Tech Stack & Librerie

Questo documento definisce le tecnologie, i framework e le librerie scelte per lo sviluppo di **Goleador**. L'obiettivo è mantenere coerenza nel codice e facilitare l'onboarding di nuovi sviluppatori.

## 🎨 Frontend (React)

| Categoria | Tecnologia | Motivazione |
| :--- | :--- | :--- |
| **Framework** | [React](https://react.dev/) + [Vite](https://vitejs.dev/) | Standard di fatto per SPA moderne. Vite offre build istantanee rispetto a CRA. |
| **Linguaggio** | [TypeScript](https://www.typescriptlang.org/) | Tipizzazione statica per ridurre bug a runtime e migliorare l'Intellisense. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Approccio utility-first per styling rapido senza scrivere file CSS separati. |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) | Componenti accessibili, belli e copiabili direttamente nel codice (non è una dipendenza npm monolitica). Basato su Radix UI. |
| **State Server** | [TanStack Query](https://tanstack.com/query) | Gestione cache, refetching automatico, loading states e sincronizzazione dati server. Sostituisce Redux per i dati API. |
| **State Client** | React Context / Zustand | Per quel poco di stato globale non-server (es. tema dark/light, stato sidebar). |
| **Routing** | [React Router v6](https://reactrouter.com/) | Standard per la navigazione client-side. |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Gestione form performante con validazione schema-based (Zod). |
| **HTTP Client** | [Axios](https://axios-http.com/) | Configurazione centralizzata per intercettori (token auth) e gestione errori. |

## ⚙️ Backend (.NET 10)

| Categoria | Tecnologia | Motivazione |
| :--- | :--- | :--- |
| **Framework** | ASP.NET Core Web API (.NET 10) | Performance elevate, cross-platform, LTS. |
| **Architettura** | Clean Architecture | Separazione netta delle responsabilità (Domain, Application, Infrastructure, API). |
| **Database Access** | Entity Framework Core | ORM maturo. Uso in modalità *Code-First*. Supporto multi-provider. |
| **Validazione** | [FluentValidation](https://docs.fluentvalidation.net/) | Regole di validazione separate dalle classi DTO/Entity per mantenere il codice pulito. |
| **Object Mapping** | [AutoMapper](https://automapper.org/) | Riduzione del codice boilerplate per convertire Entità ↔ DTO. |
| **API Documentation** | Scalar / OpenAPI | Documentazione interattiva generata automaticamente. |
| **Logging** | [Serilog](https://serilog.net/) | Logging strutturato (su console e file) per debuggare facilmente in produzione. |
| **Mediator** | [MediatR](https://github.com/jbogard/MediatR) | Per implementare pattern CQRS (Command Query Responsibility Segregation) nel layer Application. |

## 🧪 Testing & Quality

| Ambito | Strumento | Note |
| :--- | :--- | :--- |
| **Unit Testing (BE)** | [xUnit](https://xunit.net/) | Framework di test standard per .NET. |
| **Assertion (BE)** | [FluentAssertions](https://fluentassertions.com/) | Sintassi più leggibile per le asserzioni (`result.Should().BeTrue()`). |
| **Mocking (BE)** | [Moq] | Creazione semplice di mock per le dipendenze. |
| **Code Formatting** | Biome (FE) / .editorconfig (BE) | Per garantire uno stile di codice uniforme. |

## 🐳 DevOps & Infrastruttura

- **Docker:** Containerizzazione di API e Database per sviluppo locale identico alla produzione.
- **GitHub Actions:** Pipeline CI per build e test automatici ad ogni push.