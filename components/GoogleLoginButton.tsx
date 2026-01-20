"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface GoogleLoginButtonProps {
  userType?: 'customer' | 'business_owner';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function GoogleLoginButton({ userType, onSuccess, onError }: GoogleLoginButtonProps) {
  const router = useRouter();
  const { googleLogin } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Store userType in sessionStorage for callback page
    if (userType) {
      sessionStorage.setItem('pendingGoogleAuthUserType', userType);
    }

    // Wait for Google API to load
    const checkGoogleLoaded = setInterval(() => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        clearInterval(checkGoogleLoaded);
        initializeGoogle();
      }
    }, 100);

    // Cleanup after 10 seconds if not loaded
    setTimeout(() => clearInterval(checkGoogleLoaded), 10000);

    return () => clearInterval(checkGoogleLoaded);
  }, [userType]);

  const initializeGoogle = () => {
    if (!window.google || isInitialized) return;

    try {
      // Initialize with callback mode
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error);
      if (onError) {
        onError('Failed to load Google Sign-In. Please refresh the page.');
      }
    }
  };

  const handleCredentialResponse = async (response: any) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Get userType from sessionStorage
      const storedUserType = sessionStorage.getItem('pendingGoogleAuthUserType') as 'customer' | 'business_owner' | null;

      await googleLogin(response.credential, storedUserType || userType);

      // Clear stored userType
      sessionStorage.removeItem('pendingGoogleAuthUserType');

      // Call success callback
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Google authentication failed';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!isInitialized || !window.google || isLoading) return;

    setIsLoading(true);

    try {
      // Trigger the Google Sign-In flow
      // This will open account chooser without showing cached account
      window.google.accounts.id.prompt();

      // Reset loading after a short delay
      setTimeout(() => setIsLoading(false), 1000);
    } catch (error) {
      console.error('Failed to trigger Google Sign-In:', error);
      setIsLoading(false);
      if (onError) {
        onError('Failed to start Google Sign-In. Please try again.');
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoading || !isInitialized}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 dark:border-gray-400"></div>
          <span className="text-sm font-medium">Signing in...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-medium">Sign in with Google</span>
        </>
      )}
    </button>
  );
}
