import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setLogoutCallback } from '@/utils/logout';

const LogoutHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setLogoutCallback(() => {
      console.log('Logout callback triggered, navigating to /login');
      navigate('/login');
      setTimeout(() => {
        // Fallback in case React Router navigation fails
        if (window.location.pathname !== '/login') {
          console.log('Fallback: Forcing window.location.href to /login');
          window.location.href = '/login';
        }
      }, 200);
    });
  }, [navigate]);

  return null;
};

export default LogoutHandler; 