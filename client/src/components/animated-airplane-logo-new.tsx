import React from 'react';

interface AnimatedAirplaneLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AnimatedAirplaneLogo({ size = 'md', className = '' }: AnimatedAirplaneLogoProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-18 h-18'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className} airplane-logo-wrapper`}>
      <div className="airplane-container">
        {/* Animated airplane scene */}
        <div className="airplane-scene">
          <div className="sky-background">
            <div className="cloud cloud-1"></div>
            <div className="cloud cloud-2"></div>
            <div className="cloud cloud-3"></div>
            <div className="cloud cloud-4"></div>
          </div>
          
          <div className="airplane-flying">
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full airplane-svg"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Main airplane body */}
              <g className="airplane-body">
                {/* Fuselage */}
                <ellipse cx="50" cy="50" rx="30" ry="6" fill="#e0e0e0" />
                <ellipse cx="50" cy="50" rx="28" ry="5" fill="#f5f5f5" />
                
                {/* Wings */}
                <ellipse cx="45" cy="50" rx="20" ry="4" fill="#d0d0d0" />
                <ellipse cx="45" cy="50" rx="18" ry="3" fill="#e8e8e8" />
                
                {/* Tail */}
                <path d="M20 50 L15 45 L18 50 L15 55 Z" fill="#c0c0c0" />
                
                {/* Cockpit */}
                <ellipse cx="72" cy="50" rx="8" ry="4" fill="#87ceeb" />
                <ellipse cx="72" cy="50" rx="6" ry="3" fill="#b0e0e6" />
                
                {/* Engines */}
                <ellipse cx="40" cy="42" rx="4" ry="2" fill="#a0a0a0" />
                <ellipse cx="40" cy="58" rx="4" ry="2" fill="#a0a0a0" />
                
                {/* Wing details */}
                <ellipse cx="55" cy="40" rx="8" ry="1.5" fill="#d8d8d8" />
                <ellipse cx="55" cy="60" rx="8" ry="1.5" fill="#d8d8d8" />
                
                {/* Windows */}
                <circle cx="60" cy="48" r="1" fill="#4a90e2" />
                <circle cx="55" cy="48" r="1" fill="#4a90e2" />
                <circle cx="50" cy="48" r="1" fill="#4a90e2" />
                <circle cx="45" cy="48" r="1" fill="#4a90e2" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
