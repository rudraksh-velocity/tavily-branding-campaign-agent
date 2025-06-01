import React from 'react';
import { Dna } from 'lucide-react';

interface HeaderProps {
  glassStyle: string;
}

const Header: React.FC<HeaderProps> = ({ }) => {
  return (
    <div className="relative mb-16">
      <div className="text-center pt-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Dna className="h-12 w-12 text-[#468BFF]" />
          <h1 className="text-[48px] font-medium text-[#1a202c] font-['DM_Sans'] tracking-[-1px] leading-[52px] antialiased">
            Brand DNA Engine
          </h1>
        </div>
        <p className="text-gray-600 text-lg font-['DM_Sans'] mt-4">
          Comprehensive brand analysis and marketing intelligence powered by AI
        </p>
        <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-gray-500 font-['DM_Sans']">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#468BFF] rounded-full"></div>
            <span>Brand Identity Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#8FBCFA] rounded-full"></div>
            <span>Market Intelligence</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#FE363B] rounded-full"></div>
            <span>Document Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
