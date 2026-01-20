"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireBusinessOwner?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireBusinessOwner = false,
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isBusinessOwner } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (requireAdmin && !isAdmin) {
        router.push('/');
      } else if (requireBusinessOwner && !isBusinessOwner) {
        router.push('/');
      }
    }
  }, [user, loading, isAdmin, isBusinessOwner, requireAdmin, requireBusinessOwner, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoadingSpinner />;
  }

  if (requireAdmin && !isAdmin) {
    return <LoadingSpinner />;
  }

  if (requireBusinessOwner && !isBusinessOwner) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
