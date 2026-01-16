<#
.SYNOPSIS
    Script di Deploy automatico per Goleador (Backend .NET + Frontend React).
    Eseguire come AMMINISTRATORE.
#>

# ==========================================
# 1. CONFIGURAZIONE (MODIFICA QUI)
# ==========================================

# Cartella radice dove installare il sito su IIS
$DeployRoot = "C:\inetpub\wwwroot"
$BackendDest = "$DeployRoot\goleador-api"
$FrontendDest = "$DeployRoot\goleador-web"

# Nome del Sito e AppPool su IIS (per riavviarlo e sbloccare i file)
$IISWebsiteName = "GoleadorWeb" 
$IISAppPoolName = "GoleadorApi" # Assicurati che corrispondano ai nomi su IIS

# URL dell'API in produzione (verrà scritto nel .env del frontend)
# Se usi il Reverse Proxy di IIS sullo stesso dominio, metti "/api"
# Se sono su porte diverse, metti l'URL completo (es. "http://192.168.1.100:8080")
$ProdApiUrl = "http://localhost:8080" 

# Percorsi Sorgenti (Relativi alla posizione dello script)
$BackendSrc = "..\src\backend"
$FrontendSrc = "..\src\frontend"

# ==========================================
# FINE CONFIGURAZIONE
# ==========================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 Inizio Deploy di Goleador..." -ForegroundColor Cyan

# 0. Check Amministratore
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "Devi eseguire questo script come AMMINISTRATORE!"
    exit
}

# ---------------------------------------------------------
# FASE 1: STOP IIS (Per sbloccare le DLL)
# ---------------------------------------------------------
Write-Host "🛑 Fermo Application Pool e Sito..." -ForegroundColor Yellow
try {
    Stop-WebAppPool -Name $IISAppPoolName -ErrorAction SilentlyContinue
    Stop-WebSite -Name $IISWebsiteName -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2 # Aspetta che i file vengano rilasciati
}
catch {
    Write-Warning "Impossibile fermare IIS. Se è il primo deploy, ignora questo messaggio."
}

# ---------------------------------------------------------
# FASE 2: BACKEND (.NET)
# ---------------------------------------------------------
Write-Host "🏗️  Build Backend..." -ForegroundColor Green

# Pulisce destinazione
if (Test-Path $BackendDest) { Remove-Item "$BackendDest\*" -Recurse -Force }
else { New-Item -ItemType Directory -Path $BackendDest | Out-Null }

# Build & Publish
dotnet publish "$BackendSrc\Goleador.Api\Goleador.Api.csproj" -c Release -o $BackendDest

if ($LASTEXITCODE -ne 0) { Write-Error "Build Backend Fallita!"; exit }

Write-Host "✅ Backend pubblicato in $BackendDest" -ForegroundColor Green

# ---------------------------------------------------------
# FASE 3: FRONTEND (React)
# ---------------------------------------------------------
Write-Host "🎨 Build Frontend..." -ForegroundColor Green

# Pulisce destinazione
if (Test-Path $FrontendDest) { Remove-Item "$FrontendDest\*" -Recurse -Force }
else { New-Item -ItemType Directory -Path $FrontendDest | Out-Null }

Push-Location $FrontendSrc

# Crea .env di produzione al volo
Write-Host "   Generazione .env.production con API_URL: $ProdApiUrl"
"VITE_API_URL=$ProdApiUrl" | Out-File ".env.production" -Encoding utf8 -Force

# Install & Build
try {
    # Usa 'npm ci' se hai package-lock.json o pnpm install se usi pnpm
    # Qui uso comandi generici npm
    npm install
    npm run build
}
catch {
    Pop-Location
    Write-Error "Build Frontend Fallita!"
    exit
}

# Copia i file dalla cartella dist alla destinazione IIS
Copy-Item "dist\*" $FrontendDest -Recurse -Force

Pop-Location
Write-Host "✅ Frontend pubblicato in $FrontendDest" -ForegroundColor Green

# ---------------------------------------------------------
# FASE 4: CONFIGURAZIONE IIS (Web.config per React)
# ---------------------------------------------------------
Write-Host "⚙️  Generazione web.config per React Router..." -ForegroundColor Yellow

$WebConfigContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
        <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
  </system.webServer>
</configuration>
"@

$WebConfigContent | Out-File "$FrontendDest\web.config" -Encoding utf8 -Force

# ---------------------------------------------------------
# FASE 5: START IIS
# ---------------------------------------------------------
Write-Host "▶️  Riavvio IIS..." -ForegroundColor Yellow
try {
    Start-WebAppPool -Name $IISAppPoolName
    Start-WebSite -Name $IISWebsiteName
}
catch {
    Write-Warning "Impossibile avviare automaticamente il sito. Controlla IIS Manager."
}

Write-Host "🎉 DEPLOY COMPLETATO CON SUCCESSO!" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost (o il tuo binding)"
Write-Host "   Backend:  $ProdApiUrl"