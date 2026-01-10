# 📏 Coding Standards

Questo documento delinea gli standard di codifica per **Goleador**.
L'obiettivo non è essere pedanti, ma garantire che il codice scritto da persone diverse sembri scritto da un'unica persona.

## 1. Principi Generali

- **Lingua:** Il codice (nomi variabili, metodi, commenti) deve essere in **Inglese**.
- **Boy Scout Rule:** Se tocchi un file e vedi qualcosa di sporco o mal formattato, puliscilo. Lascia il codice migliore di come l'hai trovato.
- **Commenti:** Commenta il **PERCHÉ** (la logica di business complessa o decisioni strane), non il **COSA** (il codice deve essere auto-esplicativo).

## 2. Backend (.NET / C#)

### Stile e Formattazione
- Usa **PascalCase** per Classi, Metodi, Proprietà pubbliche (`GetPlayerById`).
- Usa **_camelCase** per i campi privati (`_playerRepository`).
- Usa `var` quando il tipo è ovvio dall'assegnazione (es. `var player = new Player();`), altrimenti esplicita il tipo.

### Architettura (Clean Architecture)
- **Skinny Controllers:** I Controller API non devono contenere logica di business. Devono solo:
  1. Ricevere la request.
  2. Chiamare il servizio/mediator (Application Layer).
  3. Restituire il risultato (o l'errore).
- **Domain First:** Le entità del dominio (`User`, `Match`) non devono dipendere da nulla (niente annotazioni EF Core se possibile, niente logica di presentazione).

### Async/Await
- Usa sempre **async/await** per operazioni I/O (Database, Chiamate esterne).
- **MAI** usare `.Result` o `.Wait()` (rischio deadlock). Se devi chiamare codice asincrono in un contesto sincrono, c'è un problema di design.

### Esempio Controller

❌ **Bad:**
```csharp
[HttpPost]
public IActionResult CreateMatch(MatchDto dto)
{
    // Logica nel controller = Male
    if (dto.ScoreA < 0) return BadRequest();
    
    var match = new Match { ... };
    _db.Matches.Add(match); // Accesso diretto al DB = Male
    _db.SaveChanges();
    
    return Ok();
}
```

✅ **Good:**
```csharp
[HttpPost]
public async Task<IActionResult> CreateMatch(CreateMatchCommand command)
{
    // Delega al layer Application (tramite MediatR o Service)
    var result = await _mediator.Send(command);
    
    // Gestione risposta standard
    if (!result.Success) return BadRequest(result.Errors);
    
    return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
}
```

## 3. Frontend (React / TypeScript)

### Componenti
- Usa **Functional Components** e **Hooks**. Niente Class Components.
- Nome del file = Nome del Componente (PascalCase). Es. `MatchCard.tsx`.
- Un componente per file (a meno di piccoli sotto-componenti strettamente accoppiati).

### TypeScript
- **NO `any`:** È vietato usare `any`. Se non sai il tipo, usa `unknown` o definisci un'interfaccia.
- Definisci le `Props` come interfaccia o type sopra il componente.

### Hooks & State
- **Logica complessa:** Estrai la logica complessa in Custom Hooks (es. `useMatchScore.ts`) per mantenere la UI pulita.
- **TanStack Query:** Per i dati server, usa sempre `useQuery` o `useMutation`. Non salvare i dati dell'API in uno `useState` locale se non strettamente necessario per manipolazioni temporanee.

### Styling (Tailwind + shadcn)
- Usa le utility class di Tailwind.
- Se la stringa di classi diventa illeggibile, usa la funzione helper `cn()` (standard di shadcn) o estrai un componente wrapper.

### Esempio Componente

❌ **Bad:**
```tsx
// Niente tipi, logica mischiata, stile inline
const Button = (props: any) => {
  const submit = () => {
      fetch('/api/save', ... ) // Chiamata diretta nell'handler
  }
  return <button style={{ color: 'red' }} onClick={submit}>Save</button>
}
```

✅ **Good:**
```tsx
interface SaveButtonProps {
  label: string;
  onSave: () => void;
  isLoading?: boolean;
}

export const SaveButton = ({ label, onSave, isLoading }: SaveButtonProps) => {
  return (
    <Button 
      onClick={onSave} 
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700 text-white" // Tailwind
    >
      {isLoading ? "Saving..." : label}
    </Button>
  );
};
```

## 4. Database (Entity Framework)

- **LINQ:** Preferisci la leggibilità.
- **Tracking:** Usa `.AsNoTracking()` per le query di sola lettura (migliora le performance).
- **N+1 Problem:** Fai attenzione a caricare le relazioni. Usa `.Include()` quando serve, ma non esagerare.