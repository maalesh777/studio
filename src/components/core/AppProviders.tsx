
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

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      // Check if all required Firebase config values are present
      const requiredConfigKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
      const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

      if (missingKeys.length > 0) {
        console.error(`Firebase configuration is missing the following keys: ${missingKeys.join(', ')}. Check your environment variables.`);
        return; // Don't initialize Firebase if config is incomplete
      }

      if (!recaptchaSiteKey) {
        console.error("reCAPTCHA site key (NEXT_PUBLIC_RECAPTCHA_SITE_KEY) is missing. App Check will not be initialized.");
      }

      if (!getApps().length) {
        try {
          firebaseAppInstance = initializeApp(firebaseConfig);
          // console.log("Firebase App initialized successfully.");

          // Initialize Analytics
          try {
            getAnalytics(firebaseAppInstance);
            // console.log("Firebase Analytics initialized successfully.");
          } catch (analyticsError: any) {
            console.error("Failed to initialize Firebase Analytics:", analyticsError);
          }

          // Initialize App Check (only if reCAPTCHA key is available)
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
          console.error("Failed to initialize Firebase App:", initError);
        }
      }
    }
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <SettingsProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </SettingsProvider>
  );
}
