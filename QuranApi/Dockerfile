# Use the official image as a parent image
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["QuranApi.csproj", "QuranApi/"]
RUN dotnet restore "QuranApi/QuranApi.csproj"

# Copy everything else and build the application
COPY . .
WORKDIR "/src/QuranApi"
RUN dotnet build "QuranApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "QuranApi.csproj" -c Release -o /app/publish

# Build runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "QuranApi.dll"]
