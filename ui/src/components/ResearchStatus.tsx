import React from 'react';
import { Loader2, CheckCircle2, XCircle, Zap, Brain, Target } from 'lucide-react';
import { ResearchStatusProps } from '../types';

const ResearchStatus: React.FC<ResearchStatusProps> = ({
  status,
  error,
  isComplete,
  currentPhase,
  isResetting,
  loaderColor,
  statusRef
}) => {
  if (!status) return null;

  const getStatusIcon = () => {
    if (error) {
      return <XCircle className="h-6 w-6 text-red-400" />;
    } else if (status?.step === "Complete" || isComplete) {
      return <CheckCircle2 className="h-6 w-6 text-emerald-400" />;
    } else if (currentPhase === 'search' || currentPhase === 'enrichment') {
      return <Brain className="h-6 w-6 animate-pulse text-blue-600" />;
    } else if (currentPhase === 'briefing') {
      return <Target className="h-6 w-6 animate-spin text-purple-400" />;
    } else {
      return <Loader2 className="h-6 w-6 animate-spin text-blue-600" style={{ stroke: loaderColor }} />;
    }
  };

  const getStatusColors = () => {
    if (error) {
      return 'from-red-500/20 to-rose-500/20 border-red-400/50';
    } else if (status?.step === "Complete" || isComplete) {
      return 'from-emerald-500/20 to-teal-500/20 border-emerald-400/50';
    } else if (currentPhase === 'search' || currentPhase === 'enrichment') {
      return 'from-blue-500/20 to-blue-600/20 border-blue-400/50';
    } else if (currentPhase === 'briefing') {
      return 'from-purple-500/20 to-pink-500/20 border-purple-400/50';
    } else {
      return 'from-blue-500/20 to-blue-600/20 border-blue-400/50';
    }
  };

  const getIconBackgroundColors = () => {
    if (error) {
      return 'from-red-500/30 to-rose-500/30';
    } else if (status?.step === "Complete" || isComplete) {
      return 'from-emerald-500/30 to-teal-500/30';
    } else if (currentPhase === 'search' || currentPhase === 'enrichment') {
      return 'from-blue-500/30 to-blue-600/30';
    } else if (currentPhase === 'briefing') {
      return 'from-purple-500/30 to-pink-500/30';
    } else {
      return 'from-blue-500/30 to-blue-600/30';
    }
  };

  return (
    <div 
      ref={statusRef} 
      className={`relative transition-all duration-500 ${
        isResetting ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'
      }`}
    >
      {/* Background Effects */}
      <div className={`absolute inset-0 bg-gradient-to-r ${getStatusColors()} rounded-2xl blur-xl`}></div>
      
      {/* Main Container */}
      <div className={`relative bg-white/80 backdrop-blur-xl border-2 ${getStatusColors()} rounded-2xl p-6 shadow-xl`}>
        <div className="flex items-center space-x-4">
          {/* Status Icon */}
          <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-r ${getIconBackgroundColors()} rounded-xl flex items-center justify-center shadow-lg`}>
            {getStatusIcon()}
          </div>
          
          {/* Status Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-800 font-bold text-lg">{status.step}</h3>
              {!error && !isComplete && (
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
                  <span className="text-yellow-600 text-sm font-medium">Processing</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {error || status.message}
            </p>
            
            {/* Progress Indicator */}
            {!error && !isComplete && (
              <div className="mt-3">
                <div className="w-full bg-blue-100/50 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchStatus;