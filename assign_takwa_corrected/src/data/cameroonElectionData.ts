export interface RegionData {
  name: string;
  capital: string;
  totalRegistered: number;
  totalVotes: number;
  turnout: number;
  pollingStations: {
    total: number;
    reported: number;
  };
  results: {
    [partyCode: string]: number;
  };
}

export interface PoliticalParty {
  code: string;
  name: string;
  color: string;
}

export const politicalParties: PoliticalParty[] = [
  { 
    code: 'RDPC', 
    name: 'Rassemblement Démocratique du Peuple Camerounais', 
    color: '#1E40AF' 
  },
  { 
    code: 'SDF', 
    name: 'Social Democratic Front', 
    color: '#F59E0B' 
  },
  { 
    code: 'MRC', 
    name: 'Mouvement pour la Renaissance du Cameroun', 
    color: '#DC2626' 
  },
  { 
    code: 'UNDP', 
    name: 'Union Nationale pour la Démocratie et le Progrès', 
    color: '#10B981' 
  },
  { 
    code: 'FSNC', 
    name: 'Front pour le Salut National du Cameroun', 
    color: '#6D28D9' 
  }
];

export const cameroonRegionsData: { [key: string]: RegionData } = {
  'extreme-nord': {
    name: 'Extrême-Nord',
    capital: 'Maroua',
    totalRegistered: 1250000,
    totalVotes: 980000,
    turnout: 78.4,
    pollingStations: { total: 4000, reported: 4000 },
    results: { 
      'RDPC': 550000, 
      'UNDP': 220000, 
      'SDF': 110000, 
      'MRC': 50000, 
      'FSNC': 50000 
    }
  },
  'nord': {
    name: 'Nord',
    capital: 'Garoua',
    totalRegistered: 950000,
    totalVotes: 760000,
    turnout: 80.0,
    pollingStations: { total: 3200, reported: 3100 },
    results: { 
      'RDPC': 400000, 
      'UNDP': 250000, 
      'SDF': 60000, 
      'MRC': 30000, 
      'FSNC': 20000 
    }
  },
  'adamaoua': {
    name: 'Adamaoua',
    capital: 'Ngaoundéré',
    totalRegistered: 650000,
    totalVotes: 510000,
    turnout: 78.5,
    pollingStations: { total: 2000, reported: 1950 },
    results: { 
      'RDPC': 280000, 
      'UNDP': 150000, 
      'SDF': 50000, 
      'MRC': 20000, 
      'FSNC': 10000 
    }
  },
  'est': {
    name: 'Est',
    capital: 'Bertoua',
    totalRegistered: 800000,
    totalVotes: 620000,
    turnout: 77.5,
    pollingStations: { total: 2500, reported: 2400 },
    results: { 
      'RDPC': 450000, 
      'SDF': 80000, 
      'UNDP': 40000, 
      'MRC': 30000, 
      'FSNC': 20000 
    }
  },
  'centre': {
    name: 'Centre',
    capital: 'Yaoundé',
    totalRegistered: 2800000,
    totalVotes: 1950000,
    turnout: 69.6,
    pollingStations: { total: 7000, reported: 6800 },
    results: { 
      'RDPC': 1100000, 
      'MRC': 550000, 
      'SDF': 150000, 
      'UNDP': 80000, 
      'FSNC': 70000 
    }
  },
  'sud': {
    name: 'Sud',
    capital: 'Ebolowa',
    totalRegistered: 450000,
    totalVotes: 360000,
    turnout: 80.0,
    pollingStations: { total: 1500, reported: 1500 },
    results: { 
      'RDPC': 290000, 
      'SDF': 30000, 
      'MRC': 20000, 
      'UNDP': 10000, 
      'FSNC': 10000 
    }
  },
  'littoral': {
    name: 'Littoral',
    capital: 'Douala',
    totalRegistered: 2500000,
    totalVotes: 1600000,
    turnout: 64.0,
    pollingStations: { total: 6000, reported: 5500 },
    results: { 
      'RDPC': 700000, 
      'MRC': 500000, 
      'SDF': 250000, 
      'UNDP': 80000, 
      'FSNC': 70000 
    }
  },
  'ouest': {
    name: 'Ouest',
    capital: 'Bafoussam',
    totalRegistered: 1800000,
    totalVotes: 1350000,
    turnout: 75.0,
    pollingStations: { total: 5000, reported: 4900 },
    results: { 
      'SDF': 600000, 
      'RDPC': 500000, 
      'MRC': 150000, 
      'UNDP': 50000, 
      'FSNC': 50000 
    }
  },
  'nord-ouest': {
    name: 'Nord-Ouest',
    capital: 'Bamenda',
    totalRegistered: 1500000,
    totalVotes: 750000,
    turnout: 50.0,
    pollingStations: { total: 4500, reported: 3500 },
    results: { 
      'SDF': 450000, 
      'RDPC': 200000, 
      'MRC': 50000, 
      'UNDP': 30000, 
      'FSNC': 20000 
    }
  },
  'sud-ouest': {
    name: 'Sud-Ouest',
    capital: 'Buea',
    totalRegistered: 1300000,
    totalVotes: 780000,
    turnout: 60.0,
    pollingStations: { total: 4000, reported: 3200 },
    results: { 
      'RDPC': 400000, 
      'SDF': 250000, 
      'MRC': 80000, 
      'UNDP': 30000, 
      'FSNC': 20000 
    }
  }
};

// Helper to determine the winning party in a region
export const getWinningParty = (results: { [key: string]: number } | null | undefined): string | null => {
  if (!results || typeof results !== 'object') {
    return null;
  }
  const partyCodes = Object.keys(results);
  
  if (partyCodes.length === 0) {
    return null; // Pas de résultats, pas de gagnant
  }

  return partyCodes.reduce((a, b) => (results[a] > results[b] ? a : b));
};

export const calculateNationalTotals = () => {
  const totals = {
    totalRegistered: 0,
    totalVotes: 0,
    results: {} as { [partyCode: string]: number },
    pollingStations: { total: 0, reported: 0 }
  };

  for (const region of Object.values(cameroonRegionsData)) {
    totals.totalRegistered += region.totalRegistered;
    totals.totalVotes += region.totalVotes;
    totals.pollingStations.total += region.pollingStations.total;
    totals.pollingStations.reported += region.pollingStations.reported;
    
    for (const [party, votes] of Object.entries(region.results)) {
      if (!totals.results[party]) {
        totals.results[party] = 0;
      }
      totals.results[party] += votes;
    }
  }
  
  return totals;
};

export const getRegionStatistics = () => {
  const regions = Object.entries(cameroonRegionsData);
  const stats = {
    totalRegions: regions.length,
    averageTurnout: regions.reduce((acc, [, region]) => acc + region.turnout, 0) / regions.length,
    completionRate: regions.reduce((acc, [, region]) => 
      acc + (region.pollingStations.reported / region.pollingStations.total), 0) / regions.length * 100,
    highestTurnout: Math.max(...regions.map(([, region]) => region.turnout)),
    lowestTurnout: Math.min(...regions.map(([, region]) => region.turnout))
  };
  
  return stats;
};

export type ViewMode = 'results' | 'turnout' | 'participation' | 'party-votes'; 