# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app
COPY . .
# Restore e Publish del progetto API
RUN dotnet restore Goleador.Api/Goleador.Api.csproj
RUN dotnet publish Goleador.Api/Goleador.Api.csproj -c Release -o out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "Goleador.Api.dll"]