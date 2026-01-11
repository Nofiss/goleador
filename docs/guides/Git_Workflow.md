# 🔀 Git Workflow & Strategia di Branching

Per mantenere la history pulita e facilitare la collaborazione su **Goleador**, adottiamo il **Feature Branch Workflow** abbinato ai **Conventional Commits**.

## 1. I Branch

### 🌳 `main` (Default)

- Rappresenta l'ambiente di **Produzione**.
- Il codice qui deve essere sempre compilabile e stabile.
- **Nessun commit diretto:** Le modifiche arrivano solo tramite Pull Request (PR).

### 🌿 Feature Branches

- Creati a partire da `main`.
- Usati per sviluppare nuove funzionalità o fix.
- Una volta completati, vengono mergiati su `main` tramite PR e poi cancellati.

### Convenzione Naming Branch

Usa il formato: `tipo/descrizione-kebab-case`

| Prefisso | Quando usarlo | Esempio |
| :--- | :--- | :--- |
| **feat/** | Nuova funzionalità | `feat/login-page`, `feat/create-tournament-api` |
| **fix/** | Correzione di un bug | `fix/score-calculation-error` |
| **docs/** | Solo documentazione | `docs/update-readme` |
| **chore/** | Configurazione, tool, pulizia | `chore/update-nuget-packages` |

---

## 2. Messaggi di Commit (Conventional Commits)

Seguiamo lo standard [Conventional Commits](https://www.conventionalcommits.org/).
Questo formato rende la history leggibile e permette (in futuro) di generare changelog automatici.

### Formato

```text
<tipo>(<ambito opzionale>): <descrizione breve>

[Corpo opzionale: dettagli più lunghi]
```

### Tipi (`<tipo>`)

- **feat**: Una nuova funzionalità (corrisponde a *Minor* nel Semantic Versioning).
- **fix**: Correzione di un bug (corrisponde a *Patch*).
- **docs**: Modifiche alla documentazione.
- **style**: Formattazione, punti e virgola mancanti, etc (nessun cambio di logica).
- **refactor**: Modifica al codice che non aggiunge feature né corregge bug.
- **test**: Aggiunta o correzione di test.
- **chore**: Modifiche al processo di build, docker, dipendenze (es. aggiornamento npm).

### Ambito (`<ambito>`) - Importante per Monorepo

Specifica quale parte del progetto hai toccato:

- `backend`
- `frontend`
- `db`
- `infra`

### Esempi Pratici

**Backend Feature:**
> `feat(backend): add endpoint for creating tournaments`

**Frontend Fix:**
> `fix(frontend): resolve layout issue on mobile dashboard`

**Database Change:**
> `feat(db): add Table entity and migration`

**Documentation:**
> `docs: update api guidelines`

---

## 3. Pull Requests (PR)

Quando una feature è pronta:

1. Assicurati di essere allineato con `main` (`git pull origin main`).
2. Pusha il tuo branch.
3. Apri una PR su GitHub/GitLab.

### Checklist prima del Merge

- [ ] Il codice compila senza errori.
- [ ] I test (se presenti) passano.
- [ ] Non ci sono file inutili committati (es. `bin/`, `node_modules/`).
- [ ] Il codice rispetta le convenzioni di stile.

### Strategia di Merge

Preferiamo lo **Squash and Merge**.
Questo prende tutti i commit "sporchi" del feature branch (es. "wip", "typo", "fix") e li schiaccia in un unico commit pulito sul `main`.
