import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { glassStyle, fadeInAnimation } from '../styles';

interface SidePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  title?: string;
}

const SidePanel: React.FC<SidePanelProps> = ({ 
  isOpen, 
  onToggle, 
  children, 
  title = "Analysis Report" 
}) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div 
          className={`
            fixed right-0 top-0 h-full z-40 transition-all duration-300 ease-in-out
            ${isOpen ? 'w-96' : 'w-16'}
            ${glassStyle.sidebar}
          `}
        >
          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className={`
              absolute left-4 top-6 p-2 rounded-lg transition-all duration-200
              ${glassStyle.button}
              hover:scale-105 active:scale-95
              text-white/80 hover:text-white
            `}
          >
            {isOpen ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>

          {/* Panel Content */}
          <div className={`
            h-full overflow-hidden transition-all duration-300
            ${isOpen ? 'opacity-100 pl-16 pr-6 py-6' : 'opacity-0 pl-16 pr-0 py-6'}
          `}>
            {isOpen && (
              <div className={`h-full ${fadeInAnimation.fadeIn}`}>
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {title}
                  </h2>
                  <div className="h-px bg-gradient-to-r from-purple-400/50 to-blue-400/50"></div>
                </div>

                {/* Content */}
                <div className="h-full overflow-y-auto">
                  {children}
                </div>
              </div>
            )}
          </div>

          {/* Collapsed State Icon */}
          {!isOpen && (
            <div className="absolute left-1/2 top-20 transform -translate-x-1/2">
              <FileText className="w-6 h-6 text-white/60" />
            </div>
          )}
        </div>
      </div>

      {/* Tablet Overlay */}
      <div className="hidden md:block lg:hidden">
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
              onClick={onToggle}
            />
            
            {/* Overlay Panel */}
            <div className={`
              fixed right-0 top-0 h-full w-96 z-40
              ${glassStyle.sidebar}
              ${fadeInAnimation.slideLeft}
            `}>
              <div className="p-6 h-full">
                {/* Header with Close */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    {title}
                  </h2>
                  <button
                    onClick={onToggle}
                    className={`
                      p-2 rounded-lg transition-all duration-200
                      ${glassStyle.button}
                      hover:scale-105 active:scale-95
                      text-white/80 hover:text-white
                    `}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="h-px bg-gradient-to-r from-purple-400/50 to-blue-400/50 mb-6"></div>

                {/* Content */}
                <div className="h-full overflow-y-auto">
                  {children}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Floating Toggle Button for Tablet */}
        {!isOpen && (
          <button
            onClick={onToggle}
            className={`
              fixed right-6 top-6 p-3 rounded-full z-30
              ${glassStyle.button}
              hover:scale-105 active:scale-95
              text-white/80 hover:text-white
              shadow-lg
            `}
          >
            <FileText className="w-6 h-6" />
          </button>
        )}
      </div>
    </>
  );
};

export default SidePanel;
