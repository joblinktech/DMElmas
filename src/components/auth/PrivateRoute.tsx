import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from '../../hooks/useSupabase';
import LoadingSpinner from '../ui/LoadingSpinner';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requireProfile = false 
}) => {
  const { user, userProfile } = useSupabase();
  const location = useLocation();
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login\" state={{ from: location }} replace />;
  }
  
  // If profile is required but not available, redirect to complete profile
  if (requireProfile && !userProfile) {
    return <Navigate to="/complete-profile\" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default PrivateRoute;