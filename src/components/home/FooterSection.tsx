import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QrCode, Package, LifeBuoy, Building } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const FooterSection = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  
  return (
    <footer className="bg-muted py-12 border-t">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Press Acreditations</span>
            </div>
            <p className="text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('footer.product.title')}
            </h3>
            <ul className="space-y-2">
              <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/products')}>{t('footer.product.pricing')}</Button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <LifeBuoy className="h-4 w-4" />
              {t('footer.support.title')}
            </h3>
            <ul className="space-y-2">
              <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/help')}>{t('footer.support.helpCenter')}</Button></li>
              <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/contact')}>{t('footer.support.contact')}</Button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Building className="h-4 w-4" />
              {t('footer.company.title')}
            </h3>
            <ul className="space-y-2">
              <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/about')}>{t('footer.company.about')}</Button></li>
              <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/privacy')}>Polityka prywatności</Button></li>
              <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/terms')}>Regulamin</Button></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8">
          <p className="text-sm text-muted-foreground text-center">© {new Date().getFullYear()} Press Acreditations. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
