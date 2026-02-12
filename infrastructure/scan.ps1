# Configurazione
$SonarUrl = "http://localhost:9000"
$SonarToken = "INCOLLA_IL_TUO_TOKEN_QUI"
$ProjectKey = "goleador"

# 1. Inizio scansione
dotnet sonarscanner begin /k:"$ProjectKey" /d:sonar.host.url="$SonarUrl" /d:sonar.token="$SonarToken" /d:sonar.cs.opencover.reportsPaths="**/coverage.opencover.xml" /d:sonar.javascript.lcov.reportPaths="src/frontend/coverage/lcov.info" /d:sonar.exclusions="**/node_modules/**,**/bin/**,**/obj/**,**/*.spec.tsx"

# 2. Build Backend
dotnet build src/backend/Goleador.sln

# 3. (Opzionale) Run Tests Backend per coverage
# dotnet test src/backend/Goleador.sln ...

# 4. Fine scansione (Invio dati)
dotnet sonarscanner end /d:sonar.token="$SonarToken"
