import React from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { glassStyle, progressCardStyles, fadeInAnimation } from '../styles';

interface ProgressCardProps {
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress?: number;
  details?: string[];
  className?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  description,
  status,
  progress = 0,
  details = [],
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'active':
        return <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return progressCardStyles.completed;
      case 'active':
        return progressCardStyles.active;
      case 'error':
        return progressCardStyles.error;
      default:
        return progressCardStyles.pending;
    }
  };

  const getProgressBarColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-green-400 to-green-500';
      case 'active':
        return 'bg-gradient-to-r from-purple-400 to-blue-500';
      case 'error':
        return 'bg-gradient-to-r from-red-400 to-red-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  return (
    <div 
      className={`
        ${glassStyle.progressCard}
        ${getStatusColor()}
        ${fadeInAnimation.scaleIn}
        ${className}
        group cursor-pointer
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-200 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-white/70 leading-relaxed">
            {description}
          </p>
        </div>
        <div className="ml-3 flex-shrink-0">
          {getStatusIcon()}
        </div>
      </div>

      {/* Progress Bar */}
      {status === 'active' && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white/60">Progress</span>
            <span className="text-xs text-white/80 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full ${getProgressBarColor()} transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Details */}
      {details.length > 0 && (
        <div className="space-y-1">
          {details.map((detail, index) => (
            <div 
              key={index}
              className="text-xs text-white/60 flex items-center"
            >
              <div className="w-1 h-1 bg-white/40 rounded-full mr-2 flex-shrink-0" />
              {detail}
            </div>
          ))}
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-3 right-3">
        <div className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${status === 'completed' ? 'bg-green-500/20 text-green-300' : ''}
          ${status === 'active' ? 'bg-purple-500/20 text-purple-300' : ''}
          ${status === 'error' ? 'bg-red-500/20 text-red-300' : ''}
          ${status === 'pending' ? 'bg-gray-500/20 text-gray-300' : ''}
        `}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
    </div>
  );
};

export default ProgressCard;
