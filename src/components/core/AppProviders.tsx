
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

  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      // Check if all required Firebase config values are present
      const requiredConfigKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
      const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

      if (missingKeys.length > 0) {
        const errorMsg = `Firebase configuration is missing the following keys: ${missingKeys.join(', ')}. Check your environment variables. Firebase services will not be initialized.`;
        console.error(errorMsg);
        setFirebaseError(errorMsg);
        // Do not return early, allow providers to render children
      } else {
        setFirebaseError(null); // Clear any previous error
      }

      if (!recaptchaSiteKey && !firebaseError) { // Only log reCAPTCHA error if core Firebase config is okay
        console.warn("reCAPTCHA site key (NEXT_PUBLIC_RECAPTCHA_SITE_KEY) is missing. App Check will not be initialized.");
      }

      if (!getApps().length && !firebaseError) { // Proceed only if core config is present
        try {
          firebaseAppInstance = initializeApp(firebaseConfig);
          // console.log("Firebase App initialized successfully.");
          setFirebaseInitialized(true);

          // Initialize Analytics
          try {
            getAnalytics(firebaseAppInstance);
            // console.log("Firebase Analytics initialized successfully.");
          } catch (analyticsError: any) {
            console.error("Failed to initialize Firebase Analytics:", analyticsError);
          }

          // Initialize App Check (only if reCAPTCHA key is available and core app initialized)
          if (recaptchaSiteKey && firebaseAppInstance) {
            try {
               initializeAppCheck(firebaseAppInstance, {
                provider: new ReCaptchaV3Provider(recaptchaSiteKey),
                isTokenAutoRefreshEnabled: true
              });
              // console.log("Firebase App Check initialized successfully.");
            } catch (appCheckError: any) {
              console.error("Failed to initialize Firebase App Check:", appCheckError);
            }
          }
        } catch (initError: any) {
          const errorMsg = `Failed to initialize Firebase App: ${initError instanceof Error ? initError.message : String(initError)}`;
          console.error(errorMsg);
          setFirebaseError(errorMsg);
        }
      } else if (getApps().length) {
        // Firebase already initialized (e.g. HMR)
        setFirebaseInitialized(true);
        firebaseAppInstance = getApps()[0];
      }
    }
  }, []); // Empty dependency array ensures this runs once on mount

  // Optionally, display an error message or a fallback UI if Firebase fails to initialize
  // For now, we just log it and allow the app to proceed.

  return (
    <SettingsProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </SettingsProvider>
  );
}
