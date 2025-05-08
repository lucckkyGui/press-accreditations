
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { withAuthValues } from '@/hooks/auth';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = withAuthValues();
  
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // If user is logged in, redirect to dashboard
        navigate('/dashboard');
      } else {
        // If user is not logged in, redirect to home page
        navigate('/home');
      }
    }
  }, [navigate, isAuthenticated, loading]);
  
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50">
      <div className="text-center">
        <LoadingSpinner size={12} />
        <p className="mt-4 text-muted-foreground">Ładowanie aplikacji...</p>
      </div>
    </div>
  );
};

export default Index;
