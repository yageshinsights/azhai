import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminStore } from '@/store/admin';

interface AdminGuardProps {
  children: ReactNode;
  requiredRole?: 'owner' | 'manager' | 'dispatch';
}

export default function AdminGuard({ children, requiredRole }: AdminGuardProps) {
  const { isAdminAuthenticated, adminUser } = useAdminStore();
  const location = useLocation();

  if (!isAdminAuthenticated || !adminUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requiredRole && adminUser.role !== 'owner' && adminUser.role !== requiredRole) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
