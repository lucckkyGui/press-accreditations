
import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 12 }) => {
  // Ustawienie stałej klasy na podstawie przekazanego rozmiaru
  const sizeClass = size === 12 ? 'h-12 w-12' : 
                    size === 8 ? 'h-8 w-8' : 
                    size === 6 ? 'h-6 w-6' : 
                    size === 4 ? 'h-4 w-4' : 'h-12 w-12';
                    
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full ${sizeClass} border-t-2 border-b-2 border-primary`}></div>
    </div>
  );
};

export default LoadingSpinner;
