# Documentation de l'API pour le Tableau de Bord Électoral

Ce document décrit les endpoints de l'API requis par l'application frontend pour afficher le tableau de bord des élections. Le backend doit implémenter ces endpoints pour fournir les données dans les formats spécifiés.

## Principes Généraux

-   Toutes les réponses de l'API doivent être au format **JSON**.
-   L'encodage des caractères doit être **UTF-8**.
-   En cas de succès, le code de statut HTTP doit être `200 OK`.
-   En cas d'erreur côté serveur, le code de statut doit être `500 Internal Server Error` avec un message d'erreur clair.

---

### 1. Endpoint : Statistiques Nationales Globales

Fournit les chiffres clés agrégés au niveau national pour les cartes de statistiques principales.

-   **Méthode :** `GET`
-   **URL :** `/api/stats`
-   **Description :** Récupère les totaux nationaux consolidés pour les électeurs, les votes et les bureaux de vote.

#### Réponse de succès (`200 OK`)

```json
{
  "totalRegistered": "number",
  "totalVotes": "number",
  "turnout": "number",
  "pollingStations": {
    "reported": "number",
    "total": "number"
  }
}
```

#### Exemple de Réponse

```json
{
  "totalRegistered": 12500000,
  "totalVotes": 8560000,
  "turnout": 68.48,
  "pollingStations": {
    "reported": 29550,
    "total": 31700
  }
}
```

---

### 2. Endpoint : Données Détaillées par Région

Fournit les données complètes pour chaque région, utilisées pour alimenter la carte interactive et les panneaux de détails.

-   **Méthode :** `GET`
-   **URL :** `/api/regions`
-   **Description :** Récupère un tableau de toutes les régions avec leurs statistiques électorales détaillées.

#### Réponse de succès (`200 OK`)

Un tableau d'objets, où chaque objet a la structure suivante :

```json
[
  {
    "id": "string",
    "name": "string",
    "capital": "string",
    "totalRegistered": "number",
    "totalVotes": "number",
    "turnout": "number",
    "pollingStations": {
      "reported": "number",
      "total": "number"
    },
    "results": {
      "RDPC": "number",
      "MRC": "number",
      "SDF": "number",
      "UNDP": "number",
      "FSNC": "number"
    }
  }
]
```

#### Exemple de Réponse

```json
[
  {
    "id": "centre",
    "name": "Centre",
    "capital": "Yaoundé",
    "totalRegistered": 2800000,
    "totalVotes": 1950000,
    "turnout": 69.6,
    "pollingStations": { "reported": 6800, "total": 7000 },
    "results": { "RDPC": 1100000, "MRC": 550000, "SDF": 150000, "UNDP": 80000, "FSNC": 70000 }
  },
  {
    "id": "littoral",
    "name": "Littoral",
    "capital": "Douala",
    "totalRegistered": 2500000,
    "totalVotes": 1600000,
    "turnout": 64.0,
    "pollingStations": { "reported": 5500, "total": 6000 },
    "results": { "RDPC": 700000, "MRC": 500000, "SDF": 250000, "UNDP": 80000, "FSNC": 70000 }
  }
]
```

---

### 3. Endpoint : Résultats Nationaux par Parti

Fournit les résultats agrégés par parti politique pour la liste des résultats nationaux.

-   **Méthode :** `GET`
-   **URL :** `/api/results/national`
-   **Description :** Récupère le total des votes et les résultats pour chaque parti.

#### Réponse de succès (`200 OK`)

```json
{
  "totalVotes": "number",
  "partyResults": [
    {
      "code": "string",
      "name": "string",
      "color": "string",
      "votes": "number"
    }
  ]
}
```

#### Exemple de Réponse

```json
{
  "totalVotes": 8560000,
  "partyResults": [
    {
      "code": "RDPC",
      "name": "Rassemblement Démocratique du Peuple Camerounais",
      "color": "#1E40AF",
      "votes": 4570000
    },
    {
      "code": "SDF",
      "name": "Social Democratic Front",
      "color": "#F59E0B",
      "votes": 1670000
    }
  ]
}
```

---

### 4. Endpoint : Bureaux de Vote Récents

Fournit une liste des derniers bureaux de vote mis à jour pour le tableau en bas de page.

-   **Méthode :** `GET`
-   **URL :** `/api/polling-stations/recent`
-   **Description :** Récupère une liste des 5 à 10 derniers bureaux de vote mis à jour.

#### Réponse de succès (`200 OK`)

Un tableau d'objets, où chaque objet a la structure suivante :

```json
[
  {
    "code": "string",
    "name": "string",
    "district": "string",
    "registered": "number",
    "voters": "number",
    "turnout": "number"
  }
]
```

#### Exemple de Réponse

```json
[
  {
    "code": "BV001",
    "name": "École Primaire Centrale",
    "district": "Centre-Ville",
    "registered": 450,
    "voters": 325,
    "turnout": 72.2
  },
  {
    "code": "BV003",
    "name": "Lycée Bilingue",
    "district": "Quartier Est",
    "registered": 620,
    "voters": 510,
    "turnout": 82.3
  }
]
``` 