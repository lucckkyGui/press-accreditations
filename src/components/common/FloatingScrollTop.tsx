import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FloatingScrollTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <Button
      size="icon"
      variant="secondary"
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-opacity animate-in fade-in duration-300"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Przewiń do góry"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};

export default FloatingScrollTop;
