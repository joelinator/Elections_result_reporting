import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import {
  politicalParties,
  getWinningParty,
  type ViewMode
} from '../data/cameroonElectionData';

// ===== TYPESCRIPT TYPE DEFINITIONS FOR HIGHCHARTS INTEGRATION =====

// Chart Configuration Types
interface ChartOptions {
  chart: ChartConfig;
  title: TitleOptions;
  mapNavigation: MapNavigationOptions;
  mapView?: MapViewOptions;
  legend: LegendOptions;
  tooltip: TooltipOptions;
  plotOptions: PlotOptions;
  series: SeriesOptions[];
}

interface ChartConfig extends Highcharts.ChartOptions {
  map: TopoJSONTopology | GeoJSONFeatureCollection; // GeoJSON or TopoJSON data
  backgroundColor: string;
  height: number;
  spacing: number[];
  events?: ChartEvents;
}

interface ChartEvents {
  load?: (this: Highcharts.Chart) => void;
  render?: (this: Highcharts.Chart) => void;
}

interface TitleOptions extends Highcharts.TitleOptions {
  text: string;
  style: {
    fontSize: string;
    fontWeight: string;
    color: string;
    fontFamily: string;
  };
}

interface MapNavigationOptions extends Highcharts.MapNavigationOptions {
  enabled: boolean;
  buttonOptions: {
    verticalAlign: 'top' | 'middle' | 'bottom';
  };
}

interface MapViewOptions {
  center?: [number, number];
  zoom: number;
  projection?: {
    name: string;
  };
}

interface LegendOptions {
  enabled: boolean;
  layout?: 'horizontal' | 'vertical';
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  itemStyle?: {
    fontSize: string;
    fontFamily: string;
  };
}

interface TooltipOptions {
  useHTML: boolean;
  backgroundColor: string;
  borderColor: string;
  borderRadius: number;
  shadow: boolean;
  style: {
    fontFamily: string;
  };
  formatter: (this: TooltipFormatterContext) => string;
}

interface PlotOptions extends Highcharts.PlotOptions {
  map: {
    cursor: string;
    states: {
      hover: {
        brightness: number;
      };
      select: {
        color: string;
        borderColor: string;
        borderWidth: number;
      };
    };
  };
}

// Chart Data Types
interface ChartData {
  'hc-key': string;
  name: string;
  value: number;
  color: string;
  custom: ChartCustomData;
}

interface ChartCustomData {
  regionKey: string;
  regionData: RegionData | DepartmentData;
  winningParty?: string | null;
  party?: PartyData | null;
  isDepartment: boolean;
  regionName?: string;
}

interface PartyData {
  code: string;
  name: string;
  color: string;
  votes?: number;
  candidateName?: string;
  candidateImage?: string;
  partyName?: string;
}

// Chart Point Types
interface ChartPoint extends Highcharts.Point {
  'hc-key': string;
  name: string;
  value: number;
  color: string;
  custom?: ChartCustomData;
}

// Series Configuration Types
interface SeriesOptions {
  type: 'map' | 'tiledwebmap';
  name: string;
  mapData?: TopoJSONTopology | GeoJSONFeatureCollection;
  data?: ChartData[];
  joinBy?: string;
  nullColor?: string;
  borderColor?: string;
  borderWidth?: number;
  zIndex?: number;
  opacity?: number;
  showInLegend?: boolean;
  enableMouseTracking?: boolean;
  provider?: BaseMapProvider;
  states?: SeriesStatesOptions;
  dataLabels?: DataLabelsOptions;
  events?: SeriesEvents;
}

interface SeriesStatesOptions {
  hover: {
    brightness: number;
    borderColor: string;
    borderWidth: number;
  };
  select: {
    color: string;
    borderColor: string;
    borderWidth: number;
  };
}

interface DataLabelsOptions {
  enabled: boolean;
  useHTML: boolean;
  allowOverlap: boolean;
  formatter: (this: DataLabelFormatterContext) => string;
  style: {
    textOutline: string;
    fontSize: string;
  };
  crop: boolean;
  overflow: string;
}

interface SeriesEvents {
  click?: (this: Highcharts.Series, e: MapClickEvent) => void;
}

// Event Handler Types
interface MapClickEvent extends Highcharts.SeriesClickEventObject {
  point: ChartPoint;
}

interface TooltipFormatterContext {
  point: ChartPoint;
}

interface DataLabelFormatterContext {
  point: ChartPoint;
}

// Base Map Provider Types
interface BaseMapProvider {
  type: 'Esri' | 'OpenStreetMap' | 'Stamen';
  theme: string;
}

// Map Data Types
interface TopoJSONTopology {
  type: 'Topology';
  objects: {
    [key: string]: {
      type: 'GeometryCollection';
      geometries: TopoJSONGeometry[];
    };
  };
  arcs: number[][][];
  transform?: {
    scale: [number, number];
    translate: [number, number];
  };
}

interface TopoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon' | 'Point' | 'LineString' | 'MultiLineString';
  properties?: {
    [key: string]: unknown;
  };
  arcs?: number[][];
  coordinates?: number[][] | number[][][];
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    [key: string]: unknown;
    p_code?: string;
    code?: string;
    name?: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon' | 'Point' | 'LineString' | 'MultiLineString';
    coordinates: number[][] | number[][][];
  };
}



// Debug logging function
const debugLog = (message: string, data?: unknown) => {
  console.log(`🗺️ [CameroonMapView DEBUG] ${message}`, data ? data : '');
};

interface RegionData {
  id: string;
  name: string;
  capital: string;
  totalRegistered: number;
  totalVotes: number;
  turnout: number;
  pollingStations: {
    reported: number;
    total: number;
    displayText?: string;
  };
  results: { [key: string]: number };
}

interface DepartmentData {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  totalRegistered: number;
  totalVotes: number;
  turnout: number;
  pollingStations: {
    reported: number;
    total: number;
    displayText?: string;
  };
  results: { [key: string]: number };
}

interface CameroonMapViewProps {
  regionsData: RegionData[];
  nationalResults?: {
    totalVotes: number;
    partyResults: Array<{
      code: string;
      name: string;
      color: string;
      votes: number;
    }>;
  };
  selectedParty?: string;
  viewMode: ViewMode;
  selectedRegion?: string | null;
  onRegionSelect: (regionKey: string | null) => void;
}

// Base map provider options
const baseMapProviders = {
  satellite: {
    type: 'Esri',
    theme: 'WorldImagery'
  },
  terrain: {
    type: 'Esri',
    theme: 'WorldTerrain'
  },
  streets: {
    type: 'OpenStreetMap',
    theme: 'Standard'
  },
  toner: {
    type: 'Stamen',
    theme: 'TonerLite'
  }
} as const;

type BaseMapType = keyof typeof baseMapProviders;

const CameroonMapView: React.FC<CameroonMapViewProps> = ({
  regionsData,
  nationalResults,
  selectedParty,
  viewMode,
  selectedRegion,
  onRegionSelect
}) => {
  const [mapData, setMapData] = useState<TopoJSONTopology | null>(null);
  const [departmentMapData, setDepartmentMapData] = useState<GeoJSONFeatureCollection | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [highchartsReady, setHighchartsReady] = useState(false);
  const [highchartsLoading, setHighchartsLoading] = useState(false);
  const [showDepartments] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hideZoomControls, setHideZoomControls] = useState(false);
  const baseMapType: BaseMapType = 'streets';
  const baseMapEnabled = false;
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Store Highcharts instances
  const [HighchartsInstance, setHighchartsInstance] = useState<typeof Highcharts | null>(null);
  const [HighchartsReactInstance, setHighchartsReactInstance] = useState<typeof HighchartsReact | null>(null);

  // Debug info helper - memoized to prevent re-creation
  const addDebugInfo = useCallback((info: string) => {
    debugLog(info);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  }, []);

  // Fullscreen handlers
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      // Entering fullscreen - optionally hide zoom controls
      addDebugInfo('Entering fullscreen mode');
    } else {
      // Exiting fullscreen - show zoom controls again
      setHideZoomControls(false);
      addDebugInfo('Exiting fullscreen mode');
    }
  }, [isFullscreen, addDebugInfo]);

  const toggleZoomControls = useCallback(() => {
    setHideZoomControls(!hideZoomControls);
    addDebugInfo(`Zoom controls ${hideZoomControls ? 'shown' : 'hidden'}`);
  }, [hideZoomControls, addDebugInfo]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        setHideZoomControls(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  // Load Highcharts dependencies using dynamic imports (Vite-compatible)
  useEffect(() => {
    const loadHighchartsDependencies = async () => {
      if (highchartsLoading || highchartsReady) return;

      debugLog('🔍 Starting Highcharts dependency loading...');
      setHighchartsLoading(true);
      addDebugInfo('Starting Highcharts dependency loading');

      try {
        // Method 1: Try dynamic imports (Vite/ES modules)
        debugLog('📦 Attempting dynamic import of highcharts...');
        const highchartsModule = await import('highcharts');
        const hcInstance = (highchartsModule as { default?: typeof Highcharts }).default || highchartsModule;
        debugLog('✅ Highcharts core loaded:', !!hcInstance);

        debugLog('📦 Attempting dynamic import of highcharts-react-official...');
        const reactModule = await import('highcharts-react-official');
        const hcReactInstance = reactModule.default || reactModule;
        debugLog('✅ HighchartsReact loaded:', !!hcReactInstance);

        // Load map module
        debugLog('🗺️ Loading Highcharts Map module...');
        const mapModule = await import('highcharts/modules/map');
        const HighchartsMap = (mapModule as unknown as { default?: (hc: typeof Highcharts) => void }).default || mapModule;

        if (HighchartsMap && typeof HighchartsMap === 'function') {
          debugLog('✅ Initializing Highcharts Map module...');
          try {
            (HighchartsMap as (hc: typeof Highcharts) => void)(hcInstance);
            debugLog('🎉 Highcharts Map module initialized successfully');
          } catch (mapError) {
            debugLog('⚠️ Map module initialization warning:', mapError);
          }
        }

        // Load TiledWebMap module
        debugLog('🌐 Loading TiledWebMap module...');
        try {
          const tiledModule = await import('highcharts/modules/tiledwebmap');
          const TiledWebMap = (tiledModule as unknown as { default?: (hc: typeof Highcharts) => void }).default || tiledModule;
          if (TiledWebMap && typeof TiledWebMap === 'function') {
            (TiledWebMap as (hc: typeof Highcharts) => void)(hcInstance);
            debugLog('🎉 TiledWebMap module initialized successfully');
            addDebugInfo('TiledWebMap module loaded');
          }
        } catch (tiledError) {
          debugLog('⚠️ TiledWebMap module not available:', tiledError);
          addDebugInfo('TiledWebMap module not available - install: npm install highcharts');
        }

        // Set the instances
        setHighchartsInstance(hcInstance);
        setHighchartsReactInstance(hcReactInstance as typeof HighchartsReact);
        setHighchartsReady(true);

        debugLog('🎯 Highcharts dependencies loaded successfully!');
        const version = (hcInstance as { version?: string })?.version || 'unknown';
        debugLog('📊 Highcharts version:', version);
        addDebugInfo(`Highcharts loaded successfully v${version}`);

      } catch (importError) {
        const errorMessage = importError instanceof Error ? importError.message : String(importError);
        debugLog('❌ Dynamic import failed:', errorMessage);
        addDebugInfo(`Dynamic import failed: ${errorMessage}`);

        // Method 2: Fallback - check if already loaded globally
        try {
          debugLog('🔄 Checking for globally available Highcharts...');
          const globalHC = (window as { Highcharts?: typeof Highcharts }).Highcharts;
          const globalHCReact = (window as { HighchartsReact?: typeof HighchartsReact }).HighchartsReact;

          if (globalHC && globalHCReact) {
            debugLog('✅ Found global Highcharts instances');
            setHighchartsInstance(globalHC);
            setHighchartsReactInstance(globalHCReact);
            setHighchartsReady(true);
            addDebugInfo('Using global Highcharts instances');
          } else {
            debugLog('❌ No global Highcharts found either');
            addDebugInfo('Highcharts dependencies not available - install: npm install highcharts highcharts-react-official');
          }
        } catch (globalError) {
          const globalErrorMessage = globalError instanceof Error ? globalError.message : String(globalError);
          debugLog('❌ Global check also failed:', globalErrorMessage);
          addDebugInfo(`Global check failed: ${globalErrorMessage}`);
        }
      } finally {
        setHighchartsLoading(false);
      }
    };

    loadHighchartsDependencies();
  }, [addDebugInfo, highchartsLoading, highchartsReady]); // Include all dependencies

  // Component initialization debug
  useEffect(() => {
    debugLog('🚀 CameroonMapView component mounted');
    debugLog('📊 Props received:', { selectedParty, viewMode, selectedRegion });
    addDebugInfo(`Component initialized with viewMode: ${viewMode}`);
  }, [selectedParty, viewMode, selectedRegion, addDebugInfo]);

  // --- MAPPING CORRIGÉ ---
  // Associe l'ID de la base de données à la clé géographique de Highcharts.
  const regionIdToHcKey: { [key: string]: string } = useMemo(() => ({
    '1': 'cm-ad', // Adamaoua
    '2': 'cm-ce', // Centre
    '3': 'cm-es', // Est
    '4': 'cm-en', // Extrême-Nord
    '5': 'cm-lt', // Littoral
    '6': 'cm-no', // Nord
    '7': 'cm-nw', // Nord-Ouest
    '8': 'cm-ou', // Ouest
    '9': 'cm-su', // Sud
    '10': 'cm-sw'  // Sud-Ouest
  }), []);

  // Generate sample department data based on regions with realistic political variations
  const generateDepartmentData = useCallback((regionsData: RegionData[]): DepartmentData[] => {
    const departments: DepartmentData[] = [];

    // Cameroon department names by region (approximation)
    const departmentNames: { [regionId: string]: string[] } = {
      '1': ['Mayo-Banyo', 'Faro-et-Déo', 'Djérem', 'Mbéré', 'Vina'], // Adamaoua
      '2': ['Mfoundi', 'Mefou-et-Afamba', 'Mefou-et-Akono', 'Nyong-et-Kéllé', 'Nyong-et-Mfoumou', 'Nyong-et-So\'o', 'Haute-Sanaga', 'Mbam-et-Inoubou', 'Mbam-et-Kim', 'Lékié'], // Centre
      '3': ['Boumba-et-Ngoko', 'Haut-Nyong', 'Kadey', 'Lom-et-Djérem'], // Est
      '4': ['Diamaré', 'Mayo-Danay', 'Mayo-Kani', 'Mayo-Sava', 'Logone-et-Chari', 'Mayo-Tsanaga'], // Extrême-Nord
      '5': ['Wouri', 'Nkam', 'Sanaga-Maritime', 'Mungo'], // Littoral
      '6': ['Bénoué', 'Faro', 'Mayo-Louti', 'Mayo-Rey'], // Nord
      '7': ['Boyo', 'Bui', 'Donga-Mantung', 'Menchum', 'Mezam', 'Momo', 'Ngo-Ketunjia'], // Nord-Ouest
      '8': ['Bamboutos', 'Haut-Nkam', 'Hauts-Plateaux', 'Koung-Khi', 'Menoua', 'Mifi', 'Ndé', 'Noun'], // Ouest
      '9': ['Dja-et-Lobo', 'Mvila', 'Océan', 'Vallée-du-Ntem'], // Sud
      '10': ['Fako', 'Koupé-Manengouba', 'Lebialem', 'Manyu', 'Meme', 'Ndian'] // Sud-Ouest
    };

    regionsData.forEach((region) => {
      const regionDeptNames = departmentNames[region.id] || [];
      const numDepartments = Math.max(regionDeptNames.length, 4); // Use actual count or minimum 4

      // Get available parties from the region and create realistic variations
      const regionParties = Object.keys(region.results);
      const regionWinningParty = getWinningParty(region.results);

      for (let i = 0; i < numDepartments; i++) {
        const deptId = `${region.id}-${(i + 1).toString().padStart(2, '0')}`;
        const deptName = regionDeptNames[i] || `Département ${i + 1}`;

        // Distribute region data among departments
        const baseVotes = Math.floor(region.totalVotes / numDepartments);
        const baseRegistered = Math.floor(region.totalRegistered / numDepartments);
        const basePollingStations = Math.floor(region.pollingStations.total / numDepartments);

        // Add some variation (±30% for more realistic diversity)
        const variation = 1 + (Math.random() - 0.5) * 0.6;
        const deptVotes = Math.floor(baseVotes * variation);
        const deptRegistered = Math.floor(baseRegistered * variation);
        const deptStations = Math.floor(basePollingStations * variation);

        // Create realistic political variations within departments
        const deptResults: { [key: string]: number } = {};
        let totalDeptVotes = 0;

        regionParties.forEach((party) => {
          const regionVotes = region.results[party] as number;
          const baseVotesForParty = (regionVotes / region.totalVotes) * deptVotes;

          // Add political variation: some departments may favor different parties
          let partyVariation = 1;

          // Create some departments where opposition parties do better
          if (party !== regionWinningParty && Math.random() < 0.3) {
            partyVariation = 1.5 + Math.random() * 0.8; // 50-130% boost for opposition in some areas
          } else if (party === regionWinningParty && Math.random() < 0.2) {
            partyVariation = 0.6 + Math.random() * 0.3; // Sometimes ruling party does worse
          } else {
            partyVariation = 0.8 + Math.random() * 0.4; // Normal variation
          }

          const partyVotes = Math.floor(baseVotesForParty * partyVariation);
          deptResults[party] = Math.max(partyVotes, 0);
          totalDeptVotes += deptResults[party];
        });

        // Normalize to ensure total doesn't exceed department total votes
        if (totalDeptVotes > deptVotes) {
          const scale = deptVotes / totalDeptVotes;
          Object.keys(deptResults).forEach(party => {
            deptResults[party] = Math.floor(deptResults[party] * scale);
          });
        }

        departments.push({
          id: deptId,
          name: deptName,
          regionId: region.id,
          regionName: region.name,
          totalRegistered: deptRegistered,
          totalVotes: deptVotes,
          turnout: (deptVotes / deptRegistered) * 100,
          pollingStations: {
            total: deptStations,
            reported: Math.floor(deptStations * (0.85 + Math.random() * 0.15)) // 85-100% reported
          },
          results: deptResults
        });
      }
    });

    debugLog('🏛️ Generated departments with political results:', departments.length);
    debugLog('🎨 Sample department results:', departments.slice(0, 3).map(d => ({
      name: d.name,
      winningParty: getWinningParty(d.results),
      results: d.results
    })));

    return departments;
  }, []);

  // Load map data
  useEffect(() => {
    const loadMapData = async () => {
      try {
        debugLog('🌍 Starting map data load...');
        addDebugInfo('Starting map topology download');
        setIsLoading(true);
        setError(null);

        // Load regions topology
        const regionsUrl = 'https://code.highcharts.com/mapdata/countries/cm/cm-all.topo.json';
        debugLog('📡 Fetching regions from URL:', regionsUrl);

        const regionsResponse = await fetch(regionsUrl);
        debugLog('📨 Regions response status:', `${regionsResponse.status} ${regionsResponse.statusText}`);

        if (!regionsResponse.ok) {
          throw new Error(`HTTP ${regionsResponse.status}: ${regionsResponse.statusText}`);
        }

        const regionsTopology = await regionsResponse.json() as TopoJSONTopology;
        debugLog('✅ Regions topology loaded successfully');
        setMapData(regionsTopology);

        // Load departments GeoJSON
        debugLog('📡 Fetching departments GeoJSON...');
        const departmentsResponse = await fetch('/geojson-departement-CMR.json');
        debugLog('📨 Departments response status:', `${departmentsResponse.status} ${departmentsResponse.statusText}`);

        if (!departmentsResponse.ok) {
          throw new Error(`Departments HTTP ${departmentsResponse.status}: ${departmentsResponse.statusText}`);
        }

        const departmentsGeoJSON = await departmentsResponse.json() as GeoJSONFeatureCollection;
        debugLog('✅ Departments GeoJSON loaded successfully');
        debugLog('🏛️ Departments count:', departmentsGeoJSON.features?.length || 0);
        setDepartmentMapData(departmentsGeoJSON);

        // Generate department election data
        const generatedDeptData = generateDepartmentData(regionsData);
        setDepartmentData(generatedDeptData);
        debugLog('📊 Generated department data:', generatedDeptData.length);

        addDebugInfo(`Map data loaded successfully - ${departmentsGeoJSON.features?.length || 0} departments`);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        debugLog('❌ Map data loading failed:', errorMessage);
        addDebugInfo(`Map data loading failed: ${errorMessage}`);
        setError(`Failed to load map data: ${errorMessage}`);
        setMapData(null);
        setDepartmentMapData(null);
      } finally {
        setIsLoading(false);
        debugLog('🏁 Map data loading finished');
      }
    };

    loadMapData();
  }, [addDebugInfo, generateDepartmentData, regionsData]);

  // Create party ID to code mapping from API data
  const partyIdToCodeMap = useMemo(() => {
    if (nationalResults?.partyResults) {
      const map: { [id: string]: string } = {};
      nationalResults.partyResults.forEach((party, index) => {
        // Map numeric IDs (1, 2, 3...) to party codes
        map[(index + 1).toString()] = party.code;
      });
      debugLog('🎯 Party ID mapping:', map);
      return map;
    }
    return {};
  }, [nationalResults]);

  // Enhanced candidate mapping based on API data structure
  const candidateMapping = useMemo(() => {
    return {
      'RDPC': {
        candidateName: 'Paul Biya',
        candidateImage: 'http://api.voteflow.cm/public/RDPC.jpg' // Real RDPC candidate image
      },      
      'FSNC': {
        candidateName: 'Issa Tchiroma',
        candidateImage: 'http://api.voteflow.cm/public/FSNC.jpg' 
       },
       'PAL': {
        candidateName: 'ATEKI SETA CAXTON',
        candidateImage: 'http://api.voteflow.cm/public/PAL.jpg' 
       },      
       'UNDP': {
        candidateName: 'BELLO Bouba Maigari',
        candidateImage: 'http://api.voteflow.cm/public/UNDP.jpg' 
       },      
       'MCNC': {
        candidateName: 'MCNC',
        candidateImage: 'http://api.voteflow.cm/public/MCNC.jpg' 
       },      
       'FDC': {
        candidateName: 'FDC',
        candidateImage: 'http://api.voteflow.cm/public/MCNC.jpg' 
       },      
       'UMS': {
        candidateName: 'UMS',
        candidateImage: 'http://api.voteflow.cm/public/UMS.jpg' 
       },      
       'PCRN': {
        candidateName: 'PCRN',
        candidateImage: 'http://api.voteflow.cm/public/PCRN.jpg' 
       },      
       'PURS': {
        candidateName: 'PURS',
        candidateImage: 'http://api.voteflow.cm/public/PURS.jpg' 
       },      
       'UNIVERS': {
        candidateName: 'UNIVERS',
        candidateImage: 'http://api.voteflow.cm/public/UNIVERS.jpg' 
       },      
       'SDF': {
        candidateName: 'SDF',
        candidateImage: 'http://api.voteflow.cm/public/SDF.jpg' 
       },      
       'UDC': {
        candidateName: 'UDC',
        candidateImage: 'http://api.voteflow.cm/public/UDC.jpg' 
       }
    } as Record<string, { candidateName: string | null; candidateImage: string | null }>;
  }, []);

  // Get party data from API results or fallback to hardcoded
  const getPartyData = useCallback((partyIdOrCode: string) => {
    // If we have API data, first try to map numeric ID to code
    if (nationalResults?.partyResults) {
      // Check if it's a numeric ID that needs mapping
      const mappedCode = partyIdToCodeMap[partyIdOrCode];
      const codeToLookup = mappedCode || partyIdOrCode;

      const result = nationalResults.partyResults.find(p => p.code === codeToLookup);

      // Enhance with candidate information
      if (result && candidateMapping[result.code]) {
        const enhanced = {
          ...result,
          candidateName: candidateMapping[result.code].candidateName,
          candidateImage: candidateMapping[result.code].candidateImage,
          partyName: result.name // Keep original party name separate
        };
        debugLog(`🔍 Enhanced party lookup: ${partyIdOrCode} -> ${mappedCode || partyIdOrCode} -> ${enhanced.candidateName}`, enhanced);
        return enhanced;
      }

      debugLog(`🔍 Basic party lookup: ${partyIdOrCode} -> ${mappedCode || partyIdOrCode} -> ${result?.name}`, result);
      return result;
    }
    return politicalParties.find(p => p.code === partyIdOrCode);
  }, [nationalResults, partyIdToCodeMap, candidateMapping]);

  // Get all available parties from API or fallback
  const availableParties = useMemo(() => {
    if (nationalResults?.partyResults) {
      return nationalResults.partyResults;
    }
    return politicalParties;
  }, [nationalResults]);

  // Get chart data based on view mode - MEMOIZED to prevent infinite re-renders
  const chartData = useMemo(() => {
    debugLog('📊 Generating chart data for view mode:', viewMode);

    const currentData = showDepartments ? departmentData : regionsData;

    const data = currentData.map((item) => {
      const winningPartyCode = getWinningParty(item.results);
      const party = winningPartyCode ? getPartyData(winningPartyCode) : null;

      // Debug logging for political party colors and data
      if (viewMode === 'results') {
        const resultsEmpty = !item.results || Object.keys(item.results).length === 0;
        debugLog(`🎨 ${item.name}:`, {
          results: item.results,
          isEmpty: resultsEmpty,
          totalVotes: item.totalVotes,
          winning: winningPartyCode,
          party: party?.name,
          color: party?.color
        });
      }

      let value = 0;
      let color = party?.color || '#E5E7EB'; // Light gray for no data

      if (viewMode === 'turnout') {
        value = item.turnout;
        if (value >= 80) color = '#059669';
        else if (value >= 70) color = '#10B981';
        else if (value >= 60) color = '#34D399';
        else color = '#FEF3C7';
      } else if (viewMode === 'participation') {
        value = (item.pollingStations.reported / item.pollingStations.total) * 100;
        if (value === 100) color = '#059669';
        else if (value >= 90) color = '#10B981';
        else if (value >= 80) color = '#34D399';
        else color = '#FDE68A';
      } else if (viewMode === 'party-votes') {
        if (selectedParty && item.results[selectedParty]) {
          value = item.results[selectedParty];
          const selectedPartyInfo = getPartyData(selectedParty);

          const maxVotes = Math.max(...Object.values(item.results) as number[]);
          const intensity = value / maxVotes;

          if (selectedPartyInfo) {
            const baseColor = selectedPartyInfo.color;
            if (intensity >= 0.8) color = baseColor;
            else if (intensity >= 0.6) color = baseColor + '80';
            else if (intensity >= 0.4) color = baseColor + '60';
            else if (intensity >= 0.2) color = baseColor + '40';
            else color = baseColor + '20';
          }
        } else {
          color = '#F3F4F6';
        }
      } else {
        // Results view: Show winning party color for each region/department
        value = winningPartyCode ? ((item.results[winningPartyCode] / item.totalVotes) * 100) : 0;
        color = party?.color || '#E5E7EB'; // Use neutral gray if no winning party

        // Force color assignment for debugging
        if (viewMode === 'results' && party?.color) {
          color = party.color;
          debugLog(`🎯 FORCED COLOR for ${item.name}: ${color} (${winningPartyCode})`);
        }
      }

      // For results view, always show the winning party color (no party filter effect)
      // if (viewMode === 'results' && selectedParty && selectedParty !== winningPartyCode) {
      //   color = '#E5E7EB';
      // }

      // For departments, use the p_code from GeoJSON, for regions use the mapping
      let hcKey: string;
      if (showDepartments) {
        // For departments, we need to match with the GeoJSON p_code
        const deptIndex = departmentData.indexOf(item as DepartmentData);
        if (deptIndex >= 0 && departmentMapData?.features?.[deptIndex]) {
          const feature = departmentMapData.features[deptIndex];
          hcKey = (feature.properties.p_code as string) ||
            (feature.properties.code as string) ||
            `dept-${deptIndex}`;
        } else {
          hcKey = `dept-${deptIndex >= 0 ? deptIndex : item.id}`;
        }
      } else {
        hcKey = regionIdToHcKey[item.id] || item.id;
      }

      const chartPoint = {
        'hc-key': hcKey,
        name: item.name,
        value: value,
        color: color,
        custom: {
          regionKey: item.id,
          regionData: item,
          winningParty: winningPartyCode,
          party,
          isDepartment: showDepartments,
          regionName: showDepartments ? (item as DepartmentData).regionName : undefined
        }
      };

      // Debug the final chart point
      if (viewMode === 'results') {
        debugLog(`📍 Chart point for ${item.name}:`, {
          hcKey,
          color,
          winningParty: winningPartyCode,
          partyName: party?.name
        });
      }

      return chartPoint;
    });

    return data;
  }, [viewMode, selectedParty, regionsData, departmentData, showDepartments, regionIdToHcKey, departmentMapData, getPartyData]);

  // Get chart options for Highcharts - MEMOIZED to prevent infinite re-renders
  const chartOptions = useMemo((): ChartOptions => {
    const currentMapData: TopoJSONTopology | GeoJSONFeatureCollection | null = showDepartments ? departmentMapData : mapData;
    if (!currentMapData) {
      debugLog('⚠️ No map data available for chart options');
      return {} as ChartOptions;
    }

    debugLog('⚙️ Generating chart options...');

    const series: SeriesOptions[] = [];

    // Add TiledWebMap base layer if enabled
    if (baseMapEnabled) {
      series.push({
        type: 'tiledwebmap',
        name: 'Base Map',
        provider: baseMapProviders[baseMapType],
        zIndex: 0,
        showInLegend: false,
        enableMouseTracking: false
      });
    }

    // Add the main data series
    series.push({
      type: 'map',
      name: showDepartments ? 'Résultats par Département' : 'Résultats par Région',
      mapData: currentMapData,
      data: chartData,
      joinBy: 'hc-key',
      nullColor: '#F3F4F6', // Light gray for areas with no data
      borderColor: '#999999', // Gray borders for clear separation
      borderWidth: 2, // Slightly thicker borders for better definition
      zIndex: 1,
      opacity: 1, // Full opacity for clear political party visualization
      states: {
        hover: {
          brightness: 0.1,
          borderColor: '#2563EB',
          borderWidth: 2
        },
        select: {
          color: '#2563EB',
          borderColor: '#1D4ED8',
          borderWidth: 3
        }
      },
      dataLabels: {
        enabled: !showDepartments, // Only show labels for regions (departments would be too crowded)
        useHTML: true,
        allowOverlap: true,
        formatter: function (this: DataLabelFormatterContext) {
          const point = this.point;
          const party = point.custom?.party;
          const candidateImage = party?.candidateImage;
          const candidateName = party?.candidateName || party?.name;
          const regionName = point.name;

          if (candidateImage) {
            // Show candidate image with region name
            return `<div style="text-align: center; min-width: 80px;">
              <img src="${candidateImage}" 
                   style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; 
                          border: 3px solid #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                          display: block; margin: 0 auto 4px auto;" 
                   alt="${candidateName || 'Candidat'}"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
              <div style="display: none; width: 50px; height: 50px; border-radius: 50%; 
                         background: ${party?.color}; color: white; font-weight: bold; 
                         font-size: 8px; line-height: 50px; text-align: center; 
                         border: 3px solid #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                         margin: 0 auto 4px auto;">
                ${candidateName?.split(' ')[0] || 'N/A'}
              </div>
              <div style="color: #FFFFFF; font-size: 10px; font-weight: bold; 
                         text-shadow: 1px 1px 2px rgba(0,0,0,0.8); font-family: Inter, sans-serif;">
                ${regionName}
              </div>
            </div>`;
          } else if (candidateName) {
            // Show candidate name badge with region name
            return `<div style="text-align: center; min-width: 80px;">
              <div style="background: ${party?.color}; color: white; padding: 8px 12px; 
                         border-radius: 16px; font-size: 9px; font-weight: bold; 
                         border: 2px solid #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                         margin: 0 auto 4px auto; display: inline-block; min-width: 60px;">
                ${candidateName.split(' ')[0]}
              </div>
              <div style="color: #FFFFFF; font-size: 10px; font-weight: bold; 
                         text-shadow: 1px 1px 2px rgba(0,0,0,0.8); font-family: Inter, sans-serif;">
                ${regionName}
              </div>
            </div>`;
          } else {
            // Default region name only
            return `<div style="color: #FFFFFF; font-size: 10px; font-weight: bold; 
                           text-shadow: 1px 1px 2px rgba(0,0,0,0.8); font-family: Inter, sans-serif;
                           text-align: center;">
              ${regionName}
            </div>`;
          }
        },
        style: {
          textOutline: 'none',
          fontSize: '10px'
        },
        crop: false,
        overflow: 'allow'
      },
      events: {
        click: function (this: Highcharts.Series, e: MapClickEvent) {
          const regionKey = e.point.custom?.regionKey;
          debugLog('🖱️ Region clicked:', regionKey);
          if (regionKey) {
            onRegionSelect(selectedRegion === regionKey ? null : regionKey);
          }
        }
      }
    });

    const options = {
      chart: {
        map: currentMapData,
        backgroundColor: '#FFFFFF',
        height: isFullscreen ? '100%' as any : 600,
        spacing: [10, 10, 10, 10],
        events: {
          load: function (this: Highcharts.Chart) {
            debugLog('🎉 Chart loaded successfully!');
          },
          render: function (this: Highcharts.Chart) {
            debugLog('🖼️ Chart rendered');
          }
        }
      },

      title: {
        text: 'Résultats Régionaux',
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1F2937',
          fontFamily: 'Poppins, sans-serif'
        }
      },


      mapNavigation: {
        enabled: !hideZoomControls,
        buttonOptions: {
          verticalAlign: 'bottom' as const
        }
      },

      mapView: baseMapEnabled ? {
        center: [12.3547, 3.8480] as [number, number], // Cameroon center coordinates
        zoom: 6,
        projection: {
          name: 'WebMercator' // Required for tile maps
        }
      } : {
        zoom: 6
      },

      legend: {
        enabled: viewMode !== 'results',
        layout: 'horizontal' as const,
        align: 'center' as const,
        verticalAlign: 'bottom' as const,
        itemStyle: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        }
      },

      tooltip: {
        useHTML: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#CCCCCC',
        borderRadius: 8,
        shadow: true,
        style: {
          fontFamily: 'Inter, sans-serif'
        },
        formatter: function (this: TooltipFormatterContext) {
          debugLog('💬 Tooltip triggered for region:', this.point.name);
          const point = this.point;
          const custom = point.custom;
          if (!custom) return '';

          const regionData = custom.regionData;
          const isDepartment = custom.isDepartment;

          const winningPartyData = custom.party;

          // Create enhanced winning indicator with candidate image if available
          let winningIndicator = '';
          if (winningPartyData) {
            const candidateImage = winningPartyData.candidateImage;
            const candidateName = winningPartyData.candidateName || winningPartyData.name;

            if (candidateImage) {
              winningIndicator = `<div style="display: inline-flex; align-items: center; gap: 8px; background: ${winningPartyData.color}20; padding: 6px 10px; border-radius: 16px; border: 1px solid ${winningPartyData.color}40; margin-left: 8px;">
                <img src="${candidateImage}" 
                     style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1px solid ${winningPartyData.color};" 
                     alt="${candidateName || winningPartyData.code}"
                     onerror="this.style.display='none';" />
                <div>
                  <span style="font-size: 11px; font-weight: 700; color: #374151; display: block;">${candidateName || winningPartyData.code}</span>
                  <span style="font-size: 9px; color: #6B7280; display: block;">${winningPartyData.code}</span>
                </div>
              </div>`;
            } else if (candidateName) {
              winningIndicator = `<div style="display: inline-flex; align-items: center; gap: 6px; background: ${winningPartyData.color}20; padding: 4px 8px; border-radius: 12px; border: 1px solid ${winningPartyData.color}40; margin-left: 8px;">
                <span style="width: 8px; height: 8px; background: ${winningPartyData.color}; border-radius: 50%;"></span>
                <div>
                  <span style="font-size: 11px; font-weight: 600; color: #374151; display: block;">${candidateName}</span>
                  <span style="font-size: 9px; color: #6B7280; display: block;">${winningPartyData.code}</span>
                </div>
              </div>`;
            } else {
              winningIndicator = `<div style="display: inline-flex; align-items: center; gap: 6px; background: ${winningPartyData.color}20; padding: 4px 8px; border-radius: 12px; border: 1px solid ${winningPartyData.color}40; margin-left: 8px;">
                <span style="width: 8px; height: 8px; background: ${winningPartyData.color}; border-radius: 50%;"></span>
                <span style="font-size: 11px; font-weight: 600; color: #374151;">${winningPartyData.code}</span>
              </div>`;
            }
          }

          let content = `<div style="padding: 12px; max-width: 320px; min-width: 260px;">
            <h3 style="margin: 0 0 8px 0; color: #1F2937; font-size: 16px; font-weight: bold; font-family: Poppins, sans-serif; display: flex; align-items: center; justify-content: space-between;">
              ${regionData.name}
              ${winningIndicator}
            </h3>`;

          if (isDepartment && custom.regionName) {
            content += `<p style="margin: 0 0 8px 0; color: #6B7280; font-size: 12px;"><strong>Région:</strong> ${custom.regionName}</p>`;
          }

          if (viewMode === 'results' || viewMode === 'party-votes') {
            content += `<h4 style="margin: 10px 0 5px 0; font-size: 14px; color: #374151; font-weight: 600;">Résultats par parti</h4>
              <ul style="list-style: none; padding: 0; margin: 0;">`;

            const sortedResults = Object.entries(regionData.results as Record<string, number>).sort(([, a], [, b]) => (b as number) - (a as number));

            for (const [partyCode, votes] of sortedResults) {
              const partyData = getPartyData(partyCode);
              if (partyData) {
                const percentage = (((votes as number) / regionData.totalVotes) * 100).toFixed(1);
                const isWinning = partyCode === custom.winningParty;
                const bgStyle = isWinning ? `background-color: ${partyData.color}15; border-left: 3px solid ${partyData.color};` : '';
                const textWeight = isWinning ? '700' : '600';
                const crown = isWinning ? '👑 ' : '';

                content += `<li style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #E5E7EB; min-width: 260px; ${bgStyle} border-radius: 4px; margin: 2px 0;">
                  <span style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${partyData.color}; flex-shrink: 0; ${isWinning ? 'box-shadow: 0 0 0 2px rgba(0,0,0,0.1);' : ''}"></span>
                    <span style="font-size: 13px; font-weight: ${textWeight};" title="${partyData.name}">${crown}${partyData.code}</span>
                  </span>
                  <span style="font-weight: ${textWeight}; font-size: 13px; margin-left: 10px;">${(votes as number).toLocaleString()} (${percentage}%)</span>
                </li>`;
              }
            }
            content += `</ul>`;
          }

          content += `<div style="margin-top: 10px; font-size: 13px; color: #6B7280;">
            <div><strong>Inscrits:</strong> ${regionData.totalRegistered.toLocaleString()}</div>
            <div><strong>Votants:</strong> ${regionData.totalVotes.toLocaleString()}</div>
            <div><strong>Participation:</strong> ${regionData.turnout.toFixed(1)}%</div>
          </div></div>`;

          return content;
        }
      },

      plotOptions: {
        map: {
          cursor: 'pointer',
          states: {
            hover: {
              brightness: 0.1
            },
            select: {
              color: '#2563EB',
              borderColor: '#1D4ED8',
              borderWidth: 3
            }
          }
        }
      },

      series: series
    };

    debugLog('⚙️ Chart options generated successfully');
    debugLog('📊 Series count:', series.length);
    debugLog('📊 Data points:', chartData.length);

    return options;
  }, [mapData, departmentMapData, chartData, viewMode, onRegionSelect, selectedRegion, showDepartments, baseMapEnabled, baseMapType, getPartyData, hideZoomControls, isFullscreen]); // Dependencies for memoization

  // Fallback map visualization if Highcharts is not available
  const FallbackMap = () => (
    <div className="map-container">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 font-display">
          Carte du Cameroun - {viewMode === 'results' ? 'Résultats par Région' :
            viewMode === 'turnout' ? 'Taux de Participation' :
              viewMode === 'participation' ? 'État des Bureaux de Vote' :
                'Votes par Parti'}
        </h2>
        <p className="text-sm text-gray-600 mt-1 font-body">
          Pour voir la carte interactive, installez les dépendances: <code className="bg-gray-100 px-2 py-1 rounded text-xs">npm install highcharts highcharts-react-official</code>
        </p>

        {/* Debugging panel for fallback */}
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 font-display">
                Mode de compatibilité
              </h3>
              <div className="mt-2 text-sm text-red-700 font-body">
                <p>État des dépendances:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Highcharts: {HighchartsInstance ? '✅ Chargé' : '❌ Non disponible'}</li>
                  <li>HighchartsReact: {HighchartsReactInstance ? '✅ Chargé' : '❌ Non disponible'}</li>
                  <li>Map Data: {mapData ? '✅ Chargé' : '❌ Non disponible'}</li>
                  <li>Loading State: {highchartsLoading ? '⏳ En cours...' : '✅ Terminé'}</li>
                  <li>Ready State: {highchartsReady ? '✅ Prêt' : '❌ Non prêt'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 font-display">
                Carte interactive disponible
              </h3>
              <div className="mt-2 text-sm text-blue-700 font-body">
                <p>Installez les dépendances Highcharts pour voir une carte interactive du Cameroun avec:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Navigation et zoom</li>
                  <li>Tooltips détaillés</li>
                  <li>Sélection interactive des régions</li>
                  <li>Animations fluides</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Grid layout for regions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {regionsData.map((region) => {
            const winningPartyCode = getWinningParty(region.results);
            const party = winningPartyCode ? getPartyData(winningPartyCode) : null;
            const isSelected = selectedRegion === region.id;

            let displayValue = '';
            let displayLabel = '';

            if (viewMode === 'turnout') {
              displayValue = `${region.turnout}%`;
              displayLabel = 'Participation';
            } else if (viewMode === 'participation') {
              const progress = (region.pollingStations.reported / region.pollingStations.total) * 100;
              displayValue = `${region.pollingStations.reported}/${region.pollingStations.total}`;
              displayLabel = `Bureaux (${progress.toFixed(1)}%)`;
            } else if (viewMode === 'party-votes' && selectedParty) {
              const votes = region.results[selectedParty] || 0;
              const percentage = ((votes / (region.totalVotes || 1)) * 100).toFixed(1);
              displayValue = `${votes.toLocaleString()}`;
              displayLabel = `Votes (${percentage}%)`;
            } else {
              const percentage = winningPartyCode ? ((region.results[winningPartyCode] / (region.totalVotes || 1)) * 100).toFixed(1) : '0.0';
              displayValue = winningPartyCode ? `${region.results[winningPartyCode].toLocaleString()}` : 'N/A';
              displayLabel = `${winningPartyCode || 'Aucun'} (${percentage}%)`;
            }

            return (
              <div
                key={region.id}
                className={`region-card cursor-pointer transition-all duration-200 p-4 bg-white rounded-lg border hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:border-gray-300'
                  }`}
                onClick={() => onRegionSelect(isSelected ? null : region.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 font-display">{region.name}</h3>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: viewMode === 'results' ? party?.color :
                        viewMode === 'turnout' ? (region.turnout >= 80 ? '#059669' :
                          region.turnout >= 70 ? '#10B981' :
                            region.turnout >= 60 ? '#34D399' : '#FEF3C7') :
                          viewMode === 'participation' ? '#10B981' :
                            selectedParty ? getPartyData(selectedParty)?.color : '#9CA3AF'
                    }}
                  ></div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-body">{displayLabel}</span>
                    <span className="font-semibold text-gray-900 font-body">{displayValue}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-body">Capitale</span>
                    <span className="text-gray-700 font-body">{region.capital}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-body">Inscrits</span>
                    <span className="text-gray-700 font-body">{region.totalRegistered.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Party Legend */}
        {viewMode === 'results' && availableParties && (
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {availableParties.map(party => (
              <div key={party.code} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: party.color }}
                ></div>
                <span className="text-sm font-medium font-body">{party.code}</span>
              </div>
            ))}
          </div>
        )}

        {/* Party Votes Legend */}
        {viewMode === 'party-votes' && selectedParty && (
          <div className="flex justify-center mt-6">
            <div className="bg-gray-50 px-4 py-3 rounded-lg border">
              <div className="text-sm font-medium text-gray-700 mb-2 font-body">
                Intensité des votes - {getPartyData(selectedParty)?.name}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-body">Faible</span>
                <div
                  className="w-32 h-3 rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${getPartyData(selectedParty)?.color}20, ${getPartyData(selectedParty)?.color})`
                  }}
                ></div>
                <span className="text-xs text-gray-500 font-body">Élevé</span>
              </div>
            </div>
          </div>
        )}

        {/* Turnout/Participation Legend */}
        {(viewMode === 'turnout' || viewMode === 'participation') && (
          <div className="flex justify-center mt-6">
            <div className="bg-gray-50 px-4 py-3 rounded-lg border">
              <div className="text-sm font-medium text-gray-700 mb-2 font-body">
                {viewMode === 'turnout' ? 'Taux de participation' : 'Progression des bureaux'}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-body">0%</span>
                <div className="w-32 h-3 bg-gradient-to-r from-yellow-200 via-green-300 to-green-600 rounded-full"></div>
                <span className="text-xs text-gray-500 font-body">100%</span>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info Panel for Fallback */}
        <details className="border-t border-gray-200 mt-6">
          <summary className="p-3 cursor-pointer bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100">
            🐛 Debug Information - Fallback Mode ({debugInfo.length} logs)
          </summary>
          <div className="p-3 bg-gray-50 max-h-40 overflow-y-auto">
            <div className="text-xs space-y-1 font-mono">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-gray-600">
                  {info}
                </div>
              ))}
            </div>
            <button
              onClick={() => setDebugInfo([])}
              className="mt-2 text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
            >
              Clear Logs
            </button>
          </div>
        </details>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="map-container bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600 font-body">Chargement de la carte du Cameroun...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className="map-container bg-white rounded-lg shadow-sm">
        <div className="text-center p-12">
          <div className="text-red-600 mb-2 text-4xl">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 font-display">Erreur de chargement</h3>
          <p className="text-gray-600 font-body">{error || 'Impossible de charger les données de la carte'}</p>
        </div>
      </div>
    );
  }

  // Show loading state for Highcharts
  if (highchartsLoading) {
    return (
      <div className="map-container bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
            <span className="text-gray-600 font-body">Chargement des modules Highcharts...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show interactive map if Highcharts is available, fallback otherwise
  if (highchartsReady && mapData && HighchartsInstance && HighchartsReactInstance) {
    debugLog('🎯 Rendering interactive Highcharts map');
    // Note: Don't call addDebugInfo here as it would cause re-renders

    try {
      return (
        <div 
          ref={mapContainerRef}
          className={`map-container bg-white rounded-lg shadow-sm ${isFullscreen ? 'fullscreen-map-overlay' : ''}`}
          style={isFullscreen ? {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            width: '100vw',
            height: '100vh',
            borderRadius: 0,
          } : {}}
        >
          {/* Fullscreen Exit Button - Only shown in fullscreen mode */}
          {isFullscreen && (
            <div className="fullscreen-controls">
              <button
                onClick={toggleZoomControls}
                className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title={hideZoomControls ? "Afficher les contrôles de zoom" : "Masquer les contrôles de zoom"}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {hideZoomControls ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.142 4.142M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  )}
                </svg>
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                title="Quitter le plein écran"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Map Container */}
          <div style={{ 
            height: isFullscreen ? '100vh' : '600px', 
            padding: '10px',
            paddingTop: isFullscreen ? '60px' : '10px',
            paddingBottom: isFullscreen && viewMode === 'results' && availableParties ? '120px' : '10px'
          }}>
            <HighchartsReactInstance
              highcharts={HighchartsInstance}
              constructorType={'mapChart'}
              options={chartOptions}
              ref={chartRef}
              allowChartUpdate={true}
              callback={(chart: Highcharts.Chart) => {
                debugLog('📊 Chart callback triggered:', chart);
                // Note: Don't call addDebugInfo here as it would cause re-renders
              }}
            />
          </div>

          {/* Enhanced Party Legend for results view */}
          {viewMode === 'results' && availableParties && (
            <div className={`border-t border-gray-200 bg-gray-50 p-4 ${isFullscreen ? 'fullscreen-legend' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 flex-1 text-center">
                  Légende des Partis Politiques
                </h4>
                {!isFullscreen && (
                  <button
                    onClick={toggleFullscreen}
                    className="ml-4 p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    title="Mode plein écran"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {availableParties.map(party => (
                  <div key={party.code} className="flex items-center gap-2 bg-white px-6 py-2 rounded-lg shadow-sm">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: party.color }}
                    ></div>
                    <div>
                      <span className="text-sm font-bold text-gray-900" title={party.name}>
                        {party.code}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Debug Info Panel */}
          {/* <details className="border-t border-gray-200">
            <summary className="p-3 cursor-pointer bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100">
              🐛 Debug Information ({debugInfo.length} logs) - Enhanced Map
            </summary>
            <div className="p-3 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-xs">
                <div className="bg-white p-2 rounded border">
                  <div className="font-medium text-gray-700 mb-1">Map Status</div>
                  <div>Regions: {mapData ? '✅' : '❌'}</div>
                  <div>Departments: {departmentMapData ? '✅' : '❌'}</div>
                  <div>TiledWebMap: {baseMapEnabled ? '✅' : '❌'}</div>
                  <div>Current: {showDepartments ? 'Departments' : 'Regions'}</div>
                </div>
                <div className="bg-white p-2 rounded border">
                  <div className="font-medium text-gray-700 mb-1">Data Counts</div>
                  <div>Regions: {regionsData.length}</div>
                  <div>Departments: {departmentData.length}</div>
                  <div>Map Features: {(showDepartments ? departmentMapData?.features : (mapData?.objects?.default as { geometries?: TopoJSONGeometry[] })?.geometries)?.length || 0}</div>
                  <div>Chart Points: {chartData.length}</div>
                </div>
                <div className="bg-white p-2 rounded border">
                  <div className="font-medium text-gray-700 mb-1">Libraries</div>
                  <div>Highcharts: {HighchartsInstance ? '✅' : '❌'}</div>
                  <div>React Wrapper: {HighchartsReactInstance ? '✅' : '❌'}</div>
                  <div>Version: {HighchartsInstance?.version || 'N/A'}</div>
                  <div>Ready: {highchartsReady ? '✅' : '❌'}</div>
                </div>
              </div>
              <div className="max-h-32 overflow-y-auto">
                <div className="text-xs space-y-1 font-mono">
                  {debugInfo.map((info, index) => (
                    <div key={index} className="text-gray-600">
                      {info}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setDebugInfo([])}
                className="mt-2 text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
              >
                Clear Logs
              </button>
            </div>
          </details> */}
        </div>
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      debugLog('❌ Critical error in interactive map rendering:', errorMessage);
      // Note: Don't call addDebugInfo here as it would cause re-renders
    }
  }

  debugLog('🔄 Falling back to non-interactive map');
  // Note: Don't call addDebugInfo here as it would cause re-renders
  return <FallbackMap />;
};

export default CameroonMapView; 