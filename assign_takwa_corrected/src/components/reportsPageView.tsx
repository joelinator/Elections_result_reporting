import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { getArrondissements, getDepartements, getRegions } from '../api/electionApi';

type ReportType = 'comprehensive' | 'regional' | 'departement' | 'arrondissement';

interface Region {
  code: number;
  libelle: string;
}

interface Departement {
  code: number;
  libelle: string;
}

interface Arrondissement {
  code: number;
  libelle: string;
}

const ReportsComponent = () => {
  const [reportType, setReportType] = useState<ReportType>('comprehensive');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [selectedDepartement, setSelectedDepartement] = useState<number | null>(null);
  const [selectedArrondissement, setSelectedArrondissement] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<{ name: string; url: string } | null>(null);

  // Fetch all regions
  const { data: regions = [] } = useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: () => getRegions(),
    enabled: reportType === 'regional',
  });

  // Fetch all departements
  const { data: departements = [] } = useQuery<Departement[]>({
    queryKey: ['departements'],
    queryFn: () => getDepartements(),
    enabled: reportType === 'departement',
  });

  // Fetch all arrondissements
  const { data: arrondissements = [] } = useQuery<Arrondissement[]>({
    queryKey: ['arrondissements'],
    queryFn: () => getArrondissements(),
    enabled: reportType === 'arrondissement',
  });

  // Filter lists based on search term (case-insensitive)
  const filteredRegions = useMemo(
  () =>
    regions.filter(
      r =>
        typeof r.libelle === 'string' &&
        r.libelle.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [regions, searchTerm]
);

const filteredDepartements = useMemo(
  () =>
    departements.filter(
      d =>
        typeof d.libelle === 'string' &&
        d.libelle.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [departements, searchTerm]
);

const filteredArrondissements = useMemo(
  () =>
    arrondissements.filter(
      a =>
        typeof a.libelle === 'string' &&
        a.libelle.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [arrondissements, searchTerm]
);


  const canGenerate = 
    reportType === 'comprehensive' ||
    (reportType === 'regional' && selectedRegion != null) ||
    (reportType === 'departement' && selectedDepartement != null) ||
    (reportType === 'arrondissement' && selectedArrondissement != null);

  const resetSelections = () => {
    setSelectedRegion(null);
    setSelectedDepartement(null);
    setSelectedArrondissement(null);
    setGeneratedReport(null);
  };

  const handleReportTypeChange = (type: ReportType) => {
    setReportType(type);
    setSearchTerm('');
    resetSelections();
  };

  const handleGenerateReport = async () => {
    if (!canGenerate) return;
    setModalOpen(true);
    setLoading(false);
    setGeneratedReport(null);
  };

const handleConfirmGenerate = async (format: 'pdf' | 'excel') => {
  setLoading(true);
  setGeneratedReport(null);
  //const baseUrl = 'http://api.voteflow.cm/api';
  const baseUrl = 'http://localhost:3000/api';
  try {
    let endpoint = '';
    switch (reportType) {
      case 'comprehensive':
        endpoint = `/general-report/${format}`;
        break;
      case 'regional':
        endpoint = `/region-report/${format}/${selectedRegion}`;
        break;
      case 'departement':
        endpoint = `/departement-report/${format}/${selectedDepartement}`;
        break;
      case'arrondissement':
        endpoint = `/arrondissement-report/${format}/${selectedArrondissement}`;
        break;
    }

    const response = await fetch(`${baseUrl}${endpoint}`);

    if (!response.ok) throw new Error('Erreur lors de la génération du rapport');

    // We expect a blob (binary file) response
    const blob = await response.blob();

    // Create URL for download
    const fileURL = URL.createObjectURL(blob);

    // Attempt to extract filename from content-disposition header
    let filename = `report.${format}`;
    const disposition = response.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[9];
    }

    // Save info to state to show download button
    setGeneratedReport({ name: filename, url: fileURL });
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Erreur inattendue');
  } finally {
    setLoading(false);
  }
};


//   const handleConfirmGenerate = async (format: 'pdf' | 'excel') => {
//   setLoading(true);
//   setGeneratedReport(null);
//     let responseData = null;
//   try {

//     switch (reportType) {
//       case 'comprehensive':
//         responseData = await getComprehensiveReports(format);
//         break;
//       case 'regional':
//         if (selectedRegion == null) throw new Error('Veuillez sélectionner une région');
//         responseData = await getRegionReports(format, selectedRegion);
//         break;
//       case 'departement':
//         if (selectedDepartement == null) throw new Error('Veuillez sélectionner un département');
//         responseData = await getDepartementReports(format, selectedDepartement);
//         break;
//       case 'arrondissement':
//         if (selectedArrondissement == null) throw new Error('Veuillez sélectionner un arrondissement');
//         responseData = await getArrondissementReports(format, selectedArrondissement);
//         break;
//       default:
//         throw new Error('Type de rapport non pris en charge');
//     }

//     const blob = await responseData.blob();

//     // Create URL for download
//     const fileURL = URL.createObjectURL(blob);

//     // Attempt to extract filename from content-disposition header
//     let filename = `report.${format}`;
//     const disposition = responseData.headers.get('content-disposition');
//     if (disposition && disposition.includes('filename=')) {
//       const match = disposition.match(/filename="?([^"]+)"?/);
//       if (match && match[1]) filename = match[9];
//     }

//     setGeneratedReport({ name: filename, url: fileURL });
//   } catch (err) {
//     alert(err instanceof Error ? err.message : 'Erreur inattendue');
//   } finally {
//     setLoading(false);
//   }
// };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {/* Heading */}
      <h1 className="text-4xl font-extrabold text-center mb-6 text-blue-800">
        Générateur de Rapports Électoraux
      </h1>

      {/* Report Type selector */}
      <div className="flex justify-center gap-6 mb-6">
        {(['comprehensive', 'regional', 'departement', 'arrondissement'] as ReportType[]).map(type => (
          <button
            key={type}
            onClick={() => handleReportTypeChange(type)}
            className={clsx(
              'px-6 py-3 rounded-lg font-semibold transition',
              type === reportType
                ? 'bg-blue-700 text-white shadow-lg'
                : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
            )}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Search Input */}
      {(reportType !== 'comprehensive') && (
        <div className="flex justify-center mb-8">
          <input
            type="search"
            placeholder={`Rechercher un ${reportType === 'regional' ? 'région' : reportType === 'departement' ? 'département' : 'arrondissement'}...`}
            className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search"
          />
        </div>
      )}

      {/* List Selector */}
      <div className="flex justify-center">
        {reportType === 'regional' && (
          <select
            className="w-full max-w-lg border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedRegion ?? ''}
            onChange={e => setSelectedRegion(Number(e.target.value) || null)}
          >
            <option value="">-- Sélectionnez une région --</option>
            {filteredRegions.map(region => (
              <option key={region.code} value={region.code}>
                {region.libelle}
              </option>
            ))}
          </select>
        )}

        {reportType === 'departement' && (
          <select
            className="w-full max-w-lg border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedDepartement ?? ''}
            onChange={e => setSelectedDepartement(Number(e.target.value) || null)}
          >
            <option value="">-- Sélectionnez un département --</option>
            {filteredDepartements.map(dep => (
              <option key={dep.code} value={dep.code}>
                {dep.libelle}
              </option>
            ))}
          </select>
        )}

        {reportType === 'arrondissement' && (
          <select
            className="w-full max-w-lg border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedArrondissement ?? ''}
            onChange={e => setSelectedArrondissement(Number(e.target.value) || null)}
          >
            <option value="">-- Sélectionnez un arrondissement --</option>
            {filteredArrondissements.map(arr => (
              <option key={arr.code} value={arr.code}>
                {arr.libelle}
              </option>
            ))}
          </select>
        )}
      </div> 

      {/* Generate Report button */}
      <div className="flex justify-center">
        <button
          disabled={!canGenerate}
          className={clsx(
            'btn-primary px-8 py-3 rounded-lg font-semibold transition',
            canGenerate
              ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer'
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          )}
          onClick={handleGenerateReport}
          aria-disabled={!canGenerate}
        >
          Générer le Rapport
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg text-center space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Choisissez le format du rapport</h2>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => handleConfirmGenerate('pdf')}
                disabled={loading}
                className="btn-primary px-6 py-3 rounded-lg font-semibold"
              >
                PDF
              </button>
              <button
                onClick={() => handleConfirmGenerate('excel')}
                disabled={loading}
                className="btn-primary px-6 py-3 rounded-lg font-semibold"
              >
                Excel
              </button>
            </div>
            {loading && (
              <div className="flex justify-center mt-4">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3.536-3.536a1 1 0 011.414 1.414L13.414 9H17a8 8 0 01-8 8z"
                  ></path>
                </svg>
              </div>
            )}

            {generatedReport && (
              <div className="space-y-2">
                <p className="px-4 py-2 bg-green-100 text-green-800 rounded">{generatedReport.name} généré avec succès !</p>
                <a
                  href={generatedReport.url}
                  download={generatedReport.name}
                  className="btn-primary px-6 py-2 rounded-lg font-semibold inline-block"
                >
                  Télécharger {generatedReport.name}
                </a>
              </div>
            )}

            <button
              onClick={() => {
                setModalOpen(false);
                setLoading(false);
                setGeneratedReport(null);
              }}
              className="mt-4 text-gray-600 hover:text-gray-800 font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsComponent;
