
import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 12 }) => {
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 border-primary`}></div>
    </div>
  );
};

export default LoadingSpinner;
