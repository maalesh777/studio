
"use client";

import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createContext, useContext, useEffect, useState } from 'react';
import { SettingsProvider } from '@/contexts/SettingsContext';

// Firebase imports
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth, type Auth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

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

// Define the shape of the Firebase context
interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
  user: User | null | undefined; // undefined means loading, null means not authenticated
  firebaseError: string | null;
}

// Create the Firebase context
const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  firestore: null,
  storage: null,
  user: undefined, // Initially loading
  firebaseError: null,
});

// Custom hook to use the Firebase context
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

// Store the initialized app globally to avoid re-initialization
// Use these variables to hold the *singleton* instances of services
let firebaseAppInstance: FirebaseApp | undefined = undefined;
let authInstance: Auth | undefined = undefined;
let firestoreInstance: Firestore | undefined = undefined;
let storageInstance: FirebaseStorage | undefined = undefined;


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
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined: loading, null: no user

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

      // Initialize Firebase App and Services only if not already initialized and no critical config error
      if (!getApps().length && missingKeys.length === 0) {
        try {
          firebaseAppInstance = initializeApp(firebaseConfig);
          authInstance = getAuth(firebaseAppInstance);
          firestoreInstance = getFirestore(firebaseAppInstance);
          storageInstance = getStorage(firebaseAppInstance);

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
          const initErrorMessage = `Failed to initialize Firebase App or services: ${initError instanceof Error ? initError.message : String(initError)}`;
          console.error(initErrorMessage);
          // Set a critical error if initialization failed
          setFirebaseError(prevError => prevError ? `${prevError} ${initErrorMessage}` : initErrorMessage);
        }
      } else if (getApps().length) {
        // App is already initialized, retrieve existing instances
        firebaseAppInstance = getApps()[0];
        // Retrieve service instances from the existing app instance
        try {
            authInstance = getAuth(firebaseAppInstance);
            firestoreInstance = getFirestore(firebaseAppInstance);
            storageInstance = getStorage(firebaseAppInstance);
            setFirebaseInitialized(true);
            // Note: Analytics and App Check instances are typically retrieved once
            // after the initial app initialization and don't need to be
            // re-retrieved here unless their configuration could change.
        } catch (getError: any) {
             const getErrorMessage = `Failed to get Firebase service instances from existing app: ${getError instanceof Error ? getError.message : String(getError)}`;
             console.error(getErrorMessage);
             setFirebaseError(prevError => prevError ? `${prevError} ${getErrorMessage}` : getErrorMessage);
        }
      }
    }
  }, []); // Changed dependency array to []

  useEffect(() => {
    // Subscribe to auth state changes *after* authInstance is potentially available
    // This effect depends on authInstance
    let unsubscribe: (() => void) | undefined = undefined;

    if (authInstance) {
        unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
          setUser(currentUser); // currentUser is null if logged out
        });
    } else {
        // If authInstance never became available (e.g., due to init errors)
        setUser(null); // Indicate not authenticated
    }


    // Clean up subscription on unmount or if authInstance changes
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [authInstance]); // Re-run if authInstance becomes available


  // Provide the context value
  const contextValue: FirebaseContextType = {
    app: firebaseAppInstance || null,
    auth: authInstance || null,
    firestore: firestoreInstance || null,
    storage: storageInstance || null,
    user: user,
    firebaseError: firebaseError,
  };


  return (
    <SettingsProvider>
      <QueryClientProvider client={queryClient}>
        <FirebaseContext.Provider value={contextValue}>
          {children}
        </FirebaseContext.Provider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </SettingsProvider>
  );
}
