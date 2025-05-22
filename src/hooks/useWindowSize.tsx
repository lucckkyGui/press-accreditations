
import { useState, useEffect } from 'react';

export interface WindowSize {
  width: number | undefined;
  height: number | undefined;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

// Breakpoints
const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1024;

export function useWindowSize(): WindowSize {
  // Initialize with undefined to avoid hydration mismatch
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({
        width,
        height,
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isDesktop: width >= TABLET_BREAKPOINT,
      });
    }
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}
