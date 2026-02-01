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
              <li><Button variant="link" className="p-0 h-auto">{t('footer.product.features')}</Button></li>
              <li><Button variant="link" className="p-0 h-auto">{t('footer.product.pricing')}</Button></li>
              <li><Button variant="link" className="p-0 h-auto">{t('footer.product.faq')}</Button></li>
              <li><Button variant="link" className="p-0 h-auto">{t('footer.product.forWhom')}</Button></li>
              <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/accreditation-categories')}>{t('navigation.accreditation') || 'Akredytacja'}</Button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <LifeBuoy className="h-4 w-4" />
              {t('footer.support.title')}
            </h3>
            <ul className="space-y-2">
              <li><Button variant="link" className="p-0 h-auto">{t('footer.support.helpCenter')}</Button></li>
              <li><Button variant="link" className="p-0 h-auto">{t('footer.support.contact')}</Button></li>
              <li><Button variant="link" className="p-0 h-auto">{t('footer.support.documentation')}</Button></li>
              <li><Button variant="link" className="p-0 h-auto">{t('footer.support.systemStatus')}</Button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Building className="h-4 w-4" />
              {t('footer.company.title')}
            </h3>
            <ul className="space-y-2">
              <li><Button variant="link" className="p-0 h-auto">{t('footer.company.about')}</Button></li>
              <li><Button variant="link" className="p-0 h-auto">{t('footer.company.blog')}</Button></li>
              <li><Button variant="link" className="p-0 h-auto">{t('footer.company.careers')}</Button></li>
              <li><Button variant="link" className="p-0 h-auto">{t('footer.company.privacy')}</Button></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {t('common.brand')}. {t('components.footer.rightsReserved')}</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Button variant="ghost" size="icon">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
              </svg>
            </Button>
            <Button variant="ghost" size="icon">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.286C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"></path>
              </svg>
            </Button>
            <Button variant="ghost" size="icon">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
              </svg>
            </Button>
            <Button variant="ghost" size="icon">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
