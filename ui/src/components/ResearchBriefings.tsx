import React from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Building, TrendingUp, DollarSign, Newspaper, Clock } from 'lucide-react';

type BriefingStatus = {
  company: boolean;
  industry: boolean;
  financial: boolean;
  news: boolean;
};

interface ResearchBriefingsProps {
  briefingStatus: BriefingStatus;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isResetting: boolean;
}

const ResearchBriefings: React.FC<ResearchBriefingsProps> = ({
  briefingStatus,
  isExpanded,
  onToggleExpand,
  isResetting
}) => {
  const briefingCategories = {
    company: { icon: Building, color: 'from-blue-500 to-blue-600', name: 'Company Analysis' },
    industry: { icon: TrendingUp, color: 'from-green-500 to-emerald-500', name: 'Industry Insights' },
    financial: { icon: DollarSign, color: 'from-yellow-500 to-orange-500', name: 'Financial Health' },
    news: { icon: Newspaper, color: 'from-red-500 to-pink-500', name: 'News & Updates' }
  };

  const completedCount = Object.values(briefingStatus).filter(Boolean).length;
  const totalCount = Object.keys(briefingStatus).length;

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
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                Research Briefings
              </h2>
              <p className="text-gray-600 text-sm">
                {completedCount} of {totalCount} briefings completed
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
              <span className="text-blue-700 text-sm font-medium">{completedCount}/{totalCount}</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(briefingCategories).map(([category, config]) => {
              const isCompleted = briefingStatus[category as keyof BriefingStatus];
              const IconComponent = config.icon;
              
              return (
                <div 
                  key={category}
                  className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-500 ${
                    isCompleted 
                      ? `bg-gradient-to-r ${config.color}/20 border-2 border-white/30 shadow-lg` 
                      : 'bg-blue-50/50 border border-blue-200/50 hover:bg-blue-100/50'
                  }`}
                >
                  {/* Animated Background for Completed */}
                  {isCompleted && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${config.color}/10 animate-pulse`}></div>
                  )}
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-r ${config.color} rounded-lg flex items-center justify-center shadow-md`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-gray-800 font-semibold text-sm">{config.name}</h3>
                        <p className="text-gray-600 text-xs capitalize">{category} sector</p>
                      </div>
                    </div>
                    
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400 animate-pulse" />
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-blue-200/50 rounded-full h-1 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${config.color} transition-all duration-1000 ${
                          isCompleted ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Collapsed Progress */}
        {!isExpanded && (
          <div className="mt-4">
            <div className="w-full bg-blue-200/50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchBriefings;