
import React from 'react';

const Footer = () => {
  return (
    <footer className="py-3 px-6 text-center text-sm text-muted-foreground border-t">
      <p>&copy; {new Date().getFullYear()} Press Acreditations. Wszystkie prawa zastrzeżone.</p>
    </footer>
  );
};

export default Footer;
