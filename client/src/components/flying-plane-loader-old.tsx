import React from 'react';
import '@/styles/loading-airplane.css';

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
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  // Base64 encoded airplane animation (using your provided animation)
  const airplaneAnimationGif = `data:image/gif;base64,R0lGODlhyACgAPIAAP///4CAgICAgP///wAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCAAAACwAAAAAyACgAAAD/wi63P4wykmrvTjrzbv/YCiOZGmeaKqubOu+cCzPdG3feK7vfO//wKBwSCwaj8ikcslsOp/QqHRKrVqv2Kx2y+16v+CweEwum8/otHrNbrvf8Lh8Tq/b7/i8fs/v+/+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/wADChxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTp06hTq17NurXr17Bjy55Nu7bt27hz697Nu7fv38CDCx9OvLjx48iTK1/OvLnz59CjS59Ovbr169iza9/Ovbv37+DDix9Pvrz58+jTq1/Pvr379/Djy59Pv779+/jz69/Pv7///wAGKOCABBZo4IEIJqjgggw26OCDEEYo4YQUVmjhhRhmqOGGHHbo4YcghijiiCSWaOKJKKao4oostujiizDGKOOMNNZo44045qjjjjz26OOPQAYp5JBEFmnkkUgmqeSSTDbp5JNQRinllFRWaeWVWGap5ZZcdunll2CGKeaYZJZp5plopqnmmmyW2eabc8pLAAAAOw==`;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Sky/Cloud background */}
        <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 opacity-20"></div>
        
        {/* Your airplane animation */}
        <div className={`${sizeClasses[size]} loading-airplane-container`}>
          <img 
            src={airplaneAnimationGif}
            alt="Loading airplane animation"
            className="w-full h-full object-contain loading-airplane"
          />
        </div>
      </div>
      
      {message && (
        <p className="mt-4 text-gray-600 text-center font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
