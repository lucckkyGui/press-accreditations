
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { withAuthValues } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = withAuthValues();
  
  useEffect(() => {
    if (!loading) {
      // If authentication is loaded
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }
    }
  }, [navigate, user, loading]);
  
  return <LoadingSpinner />;
};

export default Index;
