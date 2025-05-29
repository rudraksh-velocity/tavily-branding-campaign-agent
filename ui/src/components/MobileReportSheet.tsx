import React, { useEffect, useState } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { glassStyle, mobileStyles, fadeInAnimation } from '../styles';

interface MobileReportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const MobileReportSheet: React.FC<MobileReportSheetProps> = ({
  isOpen,
  onClose,
  children,
  title = "Analysis Report"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  // Handle touch events for swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const deltaY = currentY - startY;
    // If dragged down more than 100px, close the sheet
    if (deltaY > 100) {
      onClose();
    }
  };

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const translateY = isDragging ? Math.max(0, currentY - startY) : 0;

  return (
    <div className="md:hidden">
      {/* Backdrop */}
      <div 
        className={mobileStyles.overlay}
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div 
        className={`
          ${mobileStyles.bottomSheet}
          ${glassStyle.container}
          rounded-t-2xl
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{
          transform: `translateY(${translateY}px)`,
          height: '85vh',
          maxHeight: '85vh'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="pt-4 pb-2">
          <div className={mobileStyles.handle} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <h2 className="text-xl font-bold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${glassStyle.button}
              hover:scale-105 active:scale-95
              text-white/80 hover:text-white
            `}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-purple-400/50 to-blue-400/50 mx-6 mb-4"></div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {children}
        </div>

        {/* Drag Indicator */}
        {isDragging && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-1 text-white/60">
              {translateY > 50 ? (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span className="text-xs">Release to close</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span className="text-xs">Drag down to close</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileReportSheet;
