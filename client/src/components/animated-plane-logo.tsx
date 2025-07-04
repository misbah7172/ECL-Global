import React from 'react';

interface AnimatedPlaneLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AnimatedPlaneLogo({ size = 'md', className = '' }: AnimatedPlaneLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Animated Background Circle */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 animate-pulse">
        {/* Cloud effects */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute top-2 left-2 w-3 h-2 bg-white/30 rounded-full animate-float"></div>
          <div className="absolute bottom-2 right-2 w-2 h-1 bg-white/20 rounded-full animate-float-delayed"></div>
          <div className="absolute top-3 right-3 w-2 h-2 bg-white/25 rounded-full animate-float-slow"></div>
        </div>
      </div>
      
      {/* Airplane SVG */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          viewBox="0 0 24 24" 
          className="w-6 h-6 text-white animate-plane-hover"
          fill="currentColor"
        >
          {/* Airplane body */}
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-20 animate-glow"></div>
    </div>
  );
}
