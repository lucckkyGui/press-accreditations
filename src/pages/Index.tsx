
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { withAuthValues } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = withAuthValues();
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Jeśli użytkownik jest zalogowany, przekieruj do dashboardu
        navigate('/dashboard');
      } else {
        // Jeśli użytkownik nie jest zalogowany, przekieruj do głównej strony (zamiast do logowania)
        navigate('/home');
      }
    }
  }, [navigate, user, loading]);
  
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
