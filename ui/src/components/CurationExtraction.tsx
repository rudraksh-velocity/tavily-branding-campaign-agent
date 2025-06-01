import React from 'react';
import { ChevronDown, ChevronUp, Loader2, Database, Filter, Zap, Target } from 'lucide-react';

type EnrichmentCounts = {
  company: { total: number; enriched: number };
  industry: { total: number; enriched: number };
  financial: { total: number; enriched: number };
  news: { total: number; enriched: number };
};

interface CurationExtractionProps {
  enrichmentCounts: EnrichmentCounts | undefined;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isResetting: boolean;
  loaderColor: string;
}

const CurationExtraction: React.FC<CurationExtractionProps> = ({
  enrichmentCounts,
  isExpanded,
  onToggleExpand,
  isResetting,
  loaderColor
}) => {
  const categoryConfig = {
    company: { icon: Target, color: 'from-blue-500 to-blue-600' },
    industry: { icon: Filter, color: 'from-green-500 to-emerald-500' },
    financial: { icon: Zap, color: 'from-yellow-500 to-orange-500' },
    news: { icon: Database, color: 'from-red-500 to-pink-500' }
  };

  const totalEnriched = enrichmentCounts 
    ? Object.values(enrichmentCounts).reduce((acc, curr) => acc + curr.enriched, 0)
    : 0;
  
  const totalDocuments = enrichmentCounts 
    ? Object.values(enrichmentCounts).reduce((acc, curr) => acc + curr.total, 0)
    : 0;

  return (
    <div 
      className={`relative transition-all duration-500 ${
        isResetting ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'
      }`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-300/20 via-blue-400/20 to-blue-500/20 rounded-3xl blur-xl"></div>
      
      {/* Main Container */}
      <div className="relative bg-white/80 backdrop-blur-xl border-2 border-blue-200/50 rounded-3xl p-6 shadow-xl">
        {/* Header */}
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={onToggleExpand}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                Data Curation & Extraction
              </h2>
              <p className="text-gray-600 text-sm">
                {totalEnriched} documents curated from {totalDocuments} total sources
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
              <span className="text-blue-700 text-sm font-medium">{totalEnriched}</span>
            </div>
            <button className="p-2 hover:bg-blue-100/50 rounded-lg transition-all duration-200">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Content */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'mt-6 max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryConfig).map(([category, config]) => {
              const counts = enrichmentCounts?.[category as keyof EnrichmentCounts];
              const IconComponent = config.icon;
              
              return (
                <div key={category} className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-4 hover:bg-blue-100/50 transition-all duration-300">
                  <div className="text-center">
                    <div className={`w-10 h-10 bg-gradient-to-r ${config.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    
                    <h3 className="text-gray-700 font-semibold text-sm mb-2 capitalize">{category}</h3>
                    
                    <div className="space-y-2">
                      {counts ? (
                        <>
                          <div className="text-2xl font-bold text-gray-800">
                            <span className={`bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                              {counts.enriched}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            from {counts.total} sources
                          </div>
                          <div className="w-full bg-blue-200/50 rounded-full h-1">
                            <div 
                              className={`h-full bg-gradient-to-r ${config.color} rounded-full transition-all duration-1000`}
                              style={{ width: `${(counts.enriched / counts.total) * 100}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <Loader2 className="animate-spin h-6 w-6 mx-auto text-gray-500" style={{ stroke: loaderColor }} />
                          <div className="text-xs text-gray-500">Processing...</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Collapsed Summary */}
        {!isExpanded && enrichmentCounts && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Overall Progress</span>
              <span className="text-blue-700 text-sm font-medium">
                {Math.round((totalEnriched / totalDocuments) * 100)}%
              </span>
            </div>
            <div className="w-full bg-blue-200/50 rounded-full h-2">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                style={{ width: `${(totalEnriched / totalDocuments) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurationExtraction;