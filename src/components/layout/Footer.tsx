
import React from 'react';
import { useI18n } from '@/hooks/useI18n';

const Footer = () => {
  const { t } = useI18n();
  
  return (
    <footer role="contentinfo" className="py-3 px-6 text-center text-sm text-muted-foreground border-t">
      <p>&copy; {new Date().getFullYear()} PressAccreditations. {t('components.footer.rightsReserved')}</p>
    </footer>
  );
};

export default Footer;
