# Synthesis Endpoints Integration Guide

This guide explains how to use the corrected synthesis endpoints for election result aggregation in your frontend application.

## Overview

The synthesis system provides hierarchical election result aggregation:
- **Arrondissement Level**: District-level summaries
- **Departement Level**: Department-level summaries  
- **Regional Level**: Regional-level summaries

Each level includes vote counts, participation data, and party breakdowns.

## Base URL
```
/api/election/synthese
```

---

## 🏛️ ARRONDISSEMENT SYNTHESIS ENDPOINTS

### 1. Get All Arrondissement Synthesis Data
```http
GET /api/election/synthese/arrondissements
```

**Response Format:**
```json
[
  {
    "code": 1,
    "code_arrondissement": 56,
    "code_parti": 1,
    "nombre_vote": 2800,
    "nombre_inscrit": 8000,
    "nombre_votant": 6500,
    "bulletin_nul": 150,
    "date_creation": "2025-08-24T15:52:55.000Z",
    "arrondissement": {
      "code": 56,
      "libelle": "Yaoundé I",
      "abbreviation": "CE-MFO-001"
    },
    "parti": {
      "code": 1,
      "nom": "RDPC",
      "sigles": "RDPC"
    }
  }
]
```

**Frontend Usage:**
```javascript
// Fetch all arrondissement synthesis data
const fetchArrondissementSynthesis = async () => {
  try {
    const response = await fetch('/api/election/synthese/arrondissements');
    const data = await response.json();
    
    // Group by arrondissement for display
    const byArrondissement = data.reduce((acc, item) => {
      if (!acc[item.code_arrondissement]) {
        acc[item.code_arrondissement] = {
          info: item.arrondissement,
          parties: [],
          totalVotes: 0,
          totalInscrit: 0
        };
      }
      
      acc[item.code_arrondissement].parties.push({
        parti: item.parti,
        votes: item.nombre_vote
      });
      
      acc[item.code_arrondissement].totalVotes += item.nombre_vote;
      acc[item.code_arrondissement].totalInscrit = item.nombre_inscrit;
      
      return acc;
    }, {});
    
    return byArrondissement;
  } catch (error) {
    console.error('Error fetching arrondissement synthesis:', error);
  }
};
```

### 2. Get Synthesis for Specific Arrondissement
```http
GET /api/election/synthese/arrondissement/{codeArrondissement}
```

**Example:**
```http
GET /api/election/synthese/arrondissement/56
```

**Frontend Usage:**
```javascript
const fetchArrondissementResults = async (codeArrondissement) => {
  const response = await fetch(`/api/election/synthese/arrondissement/${codeArrondissement}`);
  const results = await response.json();
  
  // Calculate percentages and format for charts
  const totalVotes = results.reduce((sum, r) => sum + r.nombre_vote, 0);
  
  const chartData = results.map(result => ({
    party: result.parti.nom,
    votes: result.nombre_vote,
    percentage: ((result.nombre_vote / totalVotes) * 100).toFixed(2),
    color: getPartyColor(result.parti.sigles)
  }));
  
  return {
    arrondissement: results[0]?.arrondissement?.libelle,
    totalVotes,
    totalInscrit: results[0]?.nombre_inscrit,
    turnout: ((results[0]?.nombre_votant / results[0]?.nombre_inscrit) * 100).toFixed(2),
    results: chartData
  };
};
```

---

## 🏢 DEPARTEMENT SYNTHESIS ENDPOINTS

### 3. Get All Departement Synthesis Data
```http
GET /api/election/synthese/departements
```

### 4. Get Synthesis for Specific Departement
```http
GET /api/election/synthese/departement/{codeDepartement}
```

**Frontend Usage:**
```javascript
const fetchDepartementResults = async (codeDepartement) => {
  const response = await fetch(`/api/election/synthese/departement/${codeDepartement}`);
  const results = await response.json();
  
  return {
    departement: results[0]?.departement?.libelle,
    summary: {
      totalVotes: results.reduce((sum, r) => sum + r.nombre_vote, 0),
      totalInscrit: results[0]?.nombre_inscrit,
      turnoutRate: ((results[0]?.nombre_votant / results[0]?.nombre_inscrit) * 100).toFixed(2)
    },
    partyResults: results.map(r => ({
      party: r.parti.nom,
      votes: r.nombre_vote,
      percentage: ((r.nombre_vote / results.reduce((sum, res) => sum + res.nombre_vote, 0)) * 100).toFixed(2)
    }))
  };
};
```

---

## 🗺️ REGIONAL SYNTHESIS ENDPOINTS

### 5. Get All Regional Synthesis Data
```http
GET /api/election/synthese/regionales
```

### 6. Get Synthesis for Specific Region
```http
GET /api/election/synthese/region/{codeRegion}
```

**Frontend Dashboard Example:**
```javascript
const createRegionalDashboard = async (codeRegion) => {
  const response = await fetch(`/api/election/synthese/region/${codeRegion}`);
  const results = await response.json();
  
  const dashboardData = {
    region: results[0]?.region?.libelle,
    overview: {
      totalRegistered: results[0]?.nombre_inscrit,
      totalVotes: results.reduce((sum, r) => sum + r.nombre_vote, 0),
      nullVotes: results[0]?.bulletin_nul,
      turnout: ((results[0]?.nombre_votant / results[0]?.nombre_inscrit) * 100).toFixed(2)
    },
    partyBreakdown: results.map(result => ({
      party: result.parti.nom,
      sigles: result.parti.sigles,
      votes: result.nombre_vote,
      percentage: ((result.nombre_vote / results.reduce((s, r) => s + r.nombre_vote, 0)) * 100).toFixed(2)
    })).sort((a, b) => b.votes - a.votes)
  };
  
  return dashboardData;
};
```

---

## 🔄 AGGREGATION ENDPOINTS

### 7. Trigger Full Aggregation
```http
PUT /api/election/synthese/aggregate
```

**Response:**
```json
{
  "message": "All synthesis data aggregated successfully",
  "timestamp": "2025-08-24T15:52:55.123Z"
}
```

**Frontend Usage:**
```javascript
const triggerAggregation = async () => {
  try {
    const response = await fetch('/api/election/synthese/aggregate', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    // Show success message to user
    showNotification('success', `Data aggregated at ${result.timestamp}`);
    
    // Refresh synthesis data in your components
    await refreshAllSynthesisData();
    
  } catch (error) {
    showNotification('error', 'Aggregation failed');
    console.error('Aggregation error:', error);
  }
};
```

---

## 🧪 TESTING ENDPOINTS (Development Only)

### 8. Seed Test Data
```http
PUT /api/election/synthese/seed-test-data
```

### 9. Clear Test Data
```http
PUT /api/election/synthese/clear-test-data
```

**Testing Workflow:**
```javascript
const runTestSequence = async () => {
  try {
    // 1. Clear any existing test data
    await fetch('/api/election/synthese/clear-test-data', { method: 'PUT' });
    
    // 2. Seed new test data
    const seedResponse = await fetch('/api/election/synthese/seed-test-data', { 
      method: 'PUT' 
    });
    const seedResult = await seedResponse.json();
    
    console.log(`Seeded ${seedResult.seeded_results} results and ${seedResult.seeded_participation} participation records`);
    
    // 3. Test synthesis endpoints
    const arrondissementData = await fetch('/api/election/synthese/arrondissements').then(r => r.json());
    const departementData = await fetch('/api/election/synthese/departements').then(r => r.json());
    const regionalData = await fetch('/api/election/synthese/regionales').then(r => r.json());
    
    console.log('Test Results:', {
      arrondissements: arrondissementData.length,
      departements: departementData.length,
      regions: regionalData.length
    });
    
  } catch (error) {
    console.error('Test sequence failed:', error);
  }
};
```

---

## 📊 FRONTEND INTEGRATION EXAMPLES

### React Component Example
```jsx
import React, { useState, useEffect } from 'react';

const SynthesisResults = ({ level = 'regional', territoryCode = null }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = `/api/election/synthese/${level}s`; // arrondissements, departements, regionales
        if (territoryCode) {
          url = `/api/election/synthese/${level}/${territoryCode}`;
        }
        
        const response = await fetch(url);
        const results = await response.json();
        setData(results);
      } catch (error) {
        console.error('Error fetching synthesis data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [level, territoryCode]);
  
  if (loading) return <div>Loading synthesis data...</div>;
  
  return (
    <div className="synthesis-results">
      <h3>{level.charAt(0).toUpperCase() + level.slice(1)} Results</h3>
      {data.map(result => (
        <div key={`${result.code_arrondissement || result.code_departement || result.code_region}-${result.code_parti}`}>
          <h4>{result.parti?.nom}</h4>
          <p>Votes: {result.nombre_vote?.toLocaleString()}</p>
          <p>Registered: {result.nombre_inscrit?.toLocaleString()}</p>
          <p>Turnout: {result.nombre_votant?.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};
```

### Vue.js Component Example
```vue
<template>
  <div class="synthesis-dashboard">
    <div class="controls">
      <select v-model="selectedLevel" @change="fetchData">
        <option value="regional">Regional</option>
        <option value="departement">Department</option>
        <option value="arrondissement">District</option>
      </select>
      
      <button @click="triggerAggregation" :disabled="aggregating">
        {{ aggregating ? 'Aggregating...' : 'Refresh Data' }}
      </button>
    </div>
    
    <div class="results" v-if="synthesisData.length">
      <div v-for="result in synthesisData" :key="result.code" class="result-card">
        <h3>{{ getLocationName(result) }}</h3>
        <div class="party-results">
          <div v-for="party in getPartiesForLocation(result)" :key="party.code" class="party-result">
            <span class="party-name">{{ party.nom }}</span>
            <span class="votes">{{ party.votes.toLocaleString() }} votes</span>
            <div class="percentage">{{ party.percentage }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedLevel: 'regional',
      synthesisData: [],
      aggregating: false
    };
  },
  
  async mounted() {
    await this.fetchData();
  },
  
  methods: {
    async fetchData() {
      try {
        const response = await fetch(`/api/election/synthese/${this.selectedLevel}s`);
        this.synthesisData = await response.json();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    
    async triggerAggregation() {
      this.aggregating = true;
      try {
        await fetch('/api/election/synthese/aggregate', { method: 'PUT' });
        await this.fetchData(); // Refresh data after aggregation
      } catch (error) {
        console.error('Aggregation failed:', error);
      } finally {
        this.aggregating = false;
      }
    },
    
    getLocationName(result) {
      return result.arrondissement?.libelle || 
             result.departement?.libelle || 
             result.region?.libelle || 
             'Unknown';
    },
    
    getPartiesForLocation(result) {
      // Group and format party data for display
      return this.synthesisData
        .filter(r => this.getLocationCode(r) === this.getLocationCode(result))
        .map(r => ({
          ...r.parti,
          votes: r.nombre_vote,
          percentage: ((r.nombre_vote / this.getTotalVotes(result)) * 100).toFixed(1)
        }));
    }
  }
};
</script>
```

---

## 🚀 GETTING STARTED

1. **First, run the database fixes:**
   ```sql
   -- Execute fix_synthesis_tables.sql in your MySQL database
   ```

2. **Seed test data:**
   ```http
   PUT /api/election/synthese/seed-test-data
   ```

3. **Verify endpoints work:**
   ```http
   GET /api/election/synthese/regionales
   GET /api/election/synthese/departements  
   GET /api/election/synthese/arrondissements
   ```

4. **Integrate in your frontend:**
   - Use the provided examples as starting points
   - Implement proper error handling
   - Add loading states for better UX
   - Consider caching synthesis data

5. **Production usage:**
   - Remove or secure the test seeding endpoints
   - Implement proper authentication/authorization
   - Add input validation and rate limiting
   - Monitor aggregation performance

The synthesis system now provides proper hierarchical election result aggregation with complete participation statistics for building comprehensive election dashboards and reports.