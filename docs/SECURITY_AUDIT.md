# Vulnerability Assessment & Security Audit - Goleador

Questo documento riassume le vulnerabilità identificate e le misure di mitigazione adottate/raccomandate per il deploy pubblico dell'applicazione Goleador.

## 1. Trasporto & Network

### Reverse Proxy & Forwarded Headers
- **Rischio:** Alto
- **Descrizione:** Senza la configurazione dei `ForwardedHeaders`, l'applicazione ASP.NET Core non è in grado di determinare correttamente il protocollo originale (HTTP vs HTTPS) o l'IP del client quando posizionata dietro un reverse proxy (IIS, Nginx, Docker). Questo può causare problemi con i redirect HTTPS e l'applicazione delle policy HSTS.
- **Azione Intrapresa:** Aggiornato `Program.cs` per includere `app.UseForwardedHeaders()`.
- **Action Item:** Configurare il Reverse Proxy per inviare gli header `X-Forwarded-For` e `X-Forwarded-Proto`.

### CORS (Cross-Origin Resource Sharing)
- **Rischio:** Medio
- **Descrizione:** La policy CORS era configurata staticamente per `localhost`.
- **Azione Intrapresa:** Spostata la configurazione degli AllowedOrigins nel file `appsettings.json` per permettere la configurazione specifica per ambiente.
- **Action Item:** In produzione, limitare gli AllowedOrigins esclusivamente ai domini autorizzati (es. `https://goleador.tuodominio.it`). **MAI** usare `AllowAnyOrigin` in produzione.

## 2. Headers di Sicurezza

### Esposizione Stack Tecnologico
- **Rischio:** Basso
- **Descrizione:** L'header `Server` di Kestrel e Nginx rivelano informazioni sulla versione del server.
- **Azione Intrapresa:** Disabilitato l'header Server in Kestrel (`AddServerHeader = false`) e Nginx (`server_tokens off`).

### Security Headers (CSP, HSTS, XSS)
- **Rischio:** Medio
- **Descrizione:** Mancanza di header protettivi che istruiscono il browser a mitigare attacchi comuni (Clickjacking, XSS, Sniffing).
- **Azione Intrapresa:**
  - Implementato middleware in backend per aggiungere `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
  - Implementata una `Content-Security-Policy` (CSP) robusta sia in backend che in Nginx.
  - Abilitato HSTS per connessioni forzate in HTTPS.
- **Action Item:** Verificare che la CSP non blocchi script necessari di terze parti (es. Analytics) in produzione.

## 3. Autenticazione & Gestione Dati

### Archiviazione JWT (Access & Refresh Token)
- **Rischio:** Medio
- **Descrizione:** I token sono attualmente salvati nel `localStorage` del browser. Questo li rende vulnerabili al furto in caso di una vulnerabilità Cross-Site Scripting (XSS).
- **Mitigazione:** La CSP implementata riduce drasticamente il rischio di XSS, ma non lo elimina totalmente.
- **Action Item (Long Term):** Migrare l'archiviazione del Refresh Token verso un cookie `HttpOnly` e `Secure`.

### Sicurezza del Database
- **Rischio:** Alto
- **Descrizione:** Molte stringhe di connessione utilizzano `TrustServerCertificate=True`. In produzione, questo permette attacchi Man-in-the-Middle (MitM) poiché il client non valida il certificato SSL del database.
- **Action Item:** Impostare `TrustServerCertificate=False` e assicurarsi che il server SQL abbia un certificato valido emesso da una CA fidata dal server API.

### Gestione dei Segreti
- **Rischio:** Critico
- **Descrizione:** Segreti come `Jwt:Key` e password di database sono presenti in chiaro nei file di configurazione (sebbene come placeholder).
- **Action Item:** **NON** committare mai segreti reali. Usare variabili d'ambiente nel file `docker-compose.prod.yml` o servizi come Azure Key Vault / AWS Secrets Manager.

## 4. API & Logica Applicativa

### Rate Limiting
- **Stato:** ✅ **Verificato**.
- **Dettagli:** L'endpoint di autenticazione è protetto da un `FixedWindowLimiter` (5 tentativi/minuto per IP) per mitigare attacchi brute-force.

### Gestione Errori (Information Disclosure)
- **Stato:** ✅ **Verificato**.
- **Dettagli:** Il `GlobalExceptionHandler` cattura tutte le eccezioni e restituisce un messaggio generico "Internal Server Error" in produzione, loggando i dettagli completi solo lato server (Serilog).

### Account Lockout
- **Stato:** ✅ **Verificato**.
- **Dettagli:** ASP.NET Identity è configurato per bloccare l'account dopo 5 tentativi falliti per 15 minuti.

## 5. Hardening Infrastrutturale (IIS)

Se l'applicazione viene ospitata su IIS (Internet Information Services):
1. **Disabilitazione Protocolli Legacy:** Disabilitare TLS 1.0 e 1.1 tramite registro di sistema. Supportare solo TLS 1.2 e 1.3.
2. **App Pool Isolation:** Eseguire l'Application Pool con un account di servizio dedicato a bassi privilegi.
3. **Machine Key:** Configurare una Machine Key statica se si scala su più istanze IIS per garantire la corretta decifratura dei token/cookie.

---
**Security Assessment completato.**
*Sentinel Security Engine* 🛡️
