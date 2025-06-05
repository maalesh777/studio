
"use client";

import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';
import { SettingsProvider } from '@/contexts/SettingsContext';

// Firebase imports
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

interface AppProvidersProps {
  children: ReactNode;
}

// Store the initialized app globally to avoid re-initialization
let firebaseAppInstance: FirebaseApp | undefined = undefined;

export default function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [_firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      const requiredConfigKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
      const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

      let errorMessage = "";

      if (missingKeys.length > 0) {
        errorMessage = `Firebase configuration is missing the following keys: ${missingKeys.join(', ')}. `;
        if (process.env.NODE_ENV === 'development') {
          errorMessage += "For local development, ensure these are set in your .env.local file and that you've restarted your development server. ";
        } else {
          errorMessage += "For deployed environments, check your App Hosting backend environment variable settings. ";
        }
        errorMessage += "Firebase services will not be initialized.";
        
        console.error(errorMessage);
        setFirebaseError(errorMessage);
      } else {
        setFirebaseError(null); // Clear any previous error
      }

      if (!recaptchaSiteKey && !firebaseError) { 
        const recaptchaError = "reCAPTCHA site key (NEXT_PUBLIC_RECAPTCHA_SITE_KEY) is missing. App Check will not be initialized.";
        console.warn(recaptchaError);
        // Optionally set this as a non-critical part of firebaseError or a separate state
      }

      if (!getApps().length && !firebaseError && missingKeys.length === 0) { // Proceed only if core config is present
        try {
          firebaseAppInstance = initializeApp(firebaseConfig);
          setFirebaseInitialized(true);

          try {
            getAnalytics(firebaseAppInstance);
          } catch (analyticsError: any) {
            console.error("Failed to initialize Firebase Analytics:", analyticsError);
          }

          if (recaptchaSiteKey && firebaseAppInstance) {
            try {
               initializeAppCheck(firebaseAppInstance, {
                provider: new ReCaptchaV3Provider(recaptchaSiteKey),
                isTokenAutoRefreshEnabled: true
              });
            } catch (appCheckError: any)
             {
              console.error("Failed to initialize Firebase App Check:", appCheckError);
            }
          }
        } catch (initError: any) {
          const initErrorMessage = `Failed to initialize Firebase App: ${initError instanceof Error ? initError.message : String(initError)}`;
          console.error(initErrorMessage);
          setFirebaseError(prevError => prevError ? `${prevError} ${initErrorMessage}` : initErrorMessage);
        }
      } else if (getApps().length) {
        setFirebaseInitialized(true);
        firebaseAppInstance = getApps()[0];
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <SettingsProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </SettingsProvider>
  );
}
