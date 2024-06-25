## Inhoudsopgave
 - [Over de API](#over-de-api)
 - [Installatie](#installatie)
 - [Functionaliteiten](#functionaliteiten)
    - [Gebruiker Endpoints](#gebruiker-endpoints)
    - [Maaltijd Endpoints](#maaltijd-endpoints)
  
## Over de API

Deze API server is gemaakt voor Avans Hogeschool om aan te tonen dat ik de vaardigheid heb om een RESTfull API te maken met verschillende functionaliteiten, zoals het maken van objecten, filteren en het gebruiken van authorisatie. Ook moesten we testen met mocha en chai. De API is gemaakt door Jeffrey ofwel WorldwideErrors

## Installatie

Om de API te installeren:

1. Fork of clone de [repository](https://github.com/WorldwideErrors/programmeren-4-2024), of download simpelweg het ZIP-bestand van de repo.
2. Installeer de benodigde NPM packages:

```bash
npm install
```

### Lokaal draaien

Je kan de API ook draaien op je lokale machine

1. Start je **MySql** server op via XAMPP.
2. Run het volgende commando in de command-line van je project-directory

```bash
npm start
```

## Functionaliteiten
### Gebruiker Endpoints
Voor de gebruiker moesten we verschillende functionaliteiten maken.
Hieronder vielen onder andere het maken, verwijderen en wijzigen van de gebruiker. Ook moesten we het gebruikersprofiel kunnen ophalen van de ingelogde gebruiker en moesten we van willekeurige gebruikers ook informatie kunnen ophalen. Tot slot moesten we ook alle gebruikers in 1 keer kunnen opvragen.

| Request Type | Endpoint           | Description                       |
|--------------|--------------------|-----------------------------------|
| POST         | /api/user          | Register a user                   |
| POST         | /api/auth/login    | Log in an existing user           |
| GET          | /api/user/profile  | Get personal user profile         |
| GET          | /api/user          | Get all users                     |
| GET          | /api/user/{id}     | Get a single user by ID           |
| PUT          | /api/user/{id}     | Update a user                     |
| DELETE       | /api/user/{id}     | Delete a user                     |

### Maaltijd Endpoints
Ook voor de maaltijd moesten we zorgen dat deze kon worden aangemaakt, verwijderd en aangepast. Daarbij moesten we dan ook een maaltijd kunnen ophalen of alle maaltijden kunnen opvragen. Je mocht dan ook alleen de maaltijd verwijderen als deze door jezelf was aangemaakt. Je moest ook jezelf kunnen inschrijven voor een maaltijd. 

| Request Type | Endpoint                   | Description                       |
|--------------|----------------------------|-----------------------------------|
| POST         | /api/meal                  | Register a meal                   |
| GET          | /api/meal                  | Get all meals                     |
| GET          | /api/meal/{id}             | Get a single meal by ID           |
| PUT          | /api/meal/{id}             | Update a meal                     |
| DELETE       | /api/meal/{id}             | Delete a meal                     |
| POST         | /api/meal/{id}/participate | Join a meal!
