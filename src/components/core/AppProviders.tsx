
"use client";

import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react'; // Added useEffect
import { SettingsProvider } from '@/contexts/SettingsContext';

// Firebase imports
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-hPs4JjOg6GSGeKaUggDa2YJ8c8Qb2e8",
  authDomain: "tattoo-ai-f582e.firebaseapp.com",
  projectId: "tattoo-ai-f582e",
  storageBucket: "tattoo-ai-f582e.firebasestorage.app",
  messagingSenderId: "498697375782",
  appId: "1:498697375782:web:5389f0138f60e799afd6e7",
  measurementId: "G-6VYML0KRKN"
};

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
    // Ensure this runs only on the client and Firebase hasn't been initialized yet.
    if (typeof window !== 'undefined' && !getApps().length) {
      firebaseAppInstance = initializeApp(firebaseConfig);
      
      // Initialize Analytics
      if (firebaseAppInstance) {
        getAnalytics(firebaseAppInstance);
        
        // Initialize App Check
        initializeAppCheck(firebaseAppInstance, {
          provider: new ReCaptchaV3Provider('6LfQCj0rAAAAANKHeF1l_mXodEUBOvBe1lD_mKUv'),
          isTokenAutoRefreshEnabled: true
        });
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
