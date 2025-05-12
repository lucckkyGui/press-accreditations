
import React, { ReactNode } from 'react';

interface PageContentProps {
  children: ReactNode;
}

/**
 * PageContent component is used to wrap page content in a standardized container
 * Use this for pages that are rendered inside MainLayout via Outlet
 */
const PageContent: React.FC<PageContentProps> = ({ children }) => {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
};

export default PageContent;
