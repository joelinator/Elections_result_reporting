// PollingStationList.tsx
import React from 'react';
import type { PollingStation } from '../data/submissionData';

interface PollingStationListProps {
  pollingStations: PollingStation[];
  onStationSelect: (station: PollingStation) => void;
}

const PollingStationList: React.FC<PollingStationListProps> = ({
  pollingStations,
  onStationSelect
}) => {
  if (pollingStations.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun bureau de vote</h3>
        <p className="text-gray-500">Aucun bureau de vote n'est disponible pour votre arrondissement.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Bureaux de vote</h2>
        <p className="text-sm text-gray-500 mt-1">
          {pollingStations.length} bureau(s) de vote dans votre arrondissement
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {pollingStations.map((station) => (
          <div
            key={station.code}
            className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              station.data_filled === 1  ? 'bg-green-50' : ''
            }`}
            onClick={() => onStationSelect(station)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  station.data_filled === 1 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m2 0H9m2 0H5m2 0H3m2 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                
                <div>
                  <h3 className={`font-medium ${
                    station.data_filled === 1 ? 'text-green-800' : 'text-gray-900'
                  }`}>
                    {station.designation}
                  </h3>
                  {station.description && (
                    <p className="text-sm text-gray-500 mt-1">{station.description}</p>
                  )}
                  {station.arrondissement && (
                    <p className="text-xs text-gray-400 mt-1">
                      {station.arrondissement.libelle}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {station.data_filled === 1 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Soumis
                  </span>
                )}
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PollingStationList;