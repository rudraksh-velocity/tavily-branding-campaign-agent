import React from 'react';
import { ChevronDown, ChevronUp, Search, Target, CheckCircle, Clock } from 'lucide-react';
import { ResearchQueriesProps } from '../types';

const ResearchQueries: React.FC<ResearchQueriesProps> = ({
  queries,
  streamingQueries,
  isExpanded,
  onToggleExpand,
  isResetting,
}) => {
  const categoryIcons = {
    company: { icon: Target, color: 'text-blue-600' },
    industry: { icon: Search, color: 'text-green-500' },
    financial: { icon: ChevronUp, color: 'text-yellow-500' },
    news: { icon: Clock, color: 'text-red-500' }
  };

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
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                Research Queries
              </h2>
              <p className="text-gray-600 text-sm">
                {queries.length} queries generated across multiple categories
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
              <span className="text-blue-700 text-sm font-medium">{queries.length}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['company', 'industry', 'financial', 'news'] as const).map((category) => {
              type Category = 'company' | 'industry' | 'financial' | 'news';
              const categoryKey = category as Category;
              const categoryQueries = queries.filter(q => q.category.startsWith(category));
              const streamingQuery = Object.entries(streamingQueries).find(([key]) => key.startsWith(category));
              const IconComponent = categoryIcons[categoryKey]?.icon || Target;
              const iconColor = categoryIcons[categoryKey]?.color || 'text-gray-500';
              
              return (
                <div key={category} className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <IconComponent className={`h-5 w-5 ${iconColor}`} />
                    <h3 className="text-gray-800 font-semibold capitalize">{category} Queries</h3>
                    <span className="px-2 py-1 bg-blue-100/50 rounded-full text-xs text-gray-600">
                      {categoryQueries.length + (streamingQuery ? 1 : 0)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Streaming Query */}
                    {streamingQuery && (
                      <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-xl p-3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        <div className="relative flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                          <span className="text-gray-700 text-sm">{streamingQuery[1].text}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Completed Queries */}
                    {categoryQueries.map((query, idx) => (
                      <div key={idx} className="bg-white/60 border border-blue-200/40 rounded-xl p-3 group hover:bg-white/80 transition-all duration-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-gray-600 text-sm group-hover:text-gray-800 transition-colors">
                            {query.text}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Collapsed Summary */}
        {!isExpanded && (
          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm">
              Click to view {queries.length} generated research queries
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchQueries;