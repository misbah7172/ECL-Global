import { Plane } from "lucide-react";

interface FlyingPlaneLoaderProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export default function FlyingPlaneLoader({ 
  size = "md", 
  message = "Loading...",
  className = "" 
}: FlyingPlaneLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Flight path */}
        <div className="absolute inset-0 w-32 h-16 opacity-20">
          <svg 
            viewBox="0 0 128 64" 
            className="w-full h-full"
          >
            <path
              d="M 8 32 Q 32 8 64 32 Q 96 56 120 32"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
              className="text-blue-400"
            />
          </svg>
        </div>
        
        {/* Flying plane */}
        <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg plane-flying`}>
          <Plane className={`${iconSizes[size]} text-white plane-icon`} />
        </div>
        
        {/* Cloud effects */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/40 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white/30 rounded-full animate-pulse delay-300"></div>
      </div>
      
      {message && (
        <p className="mt-4 text-gray-600 text-center font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
