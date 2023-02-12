import type { AppProps } from 'next/app';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { useEffect } from 'react';



export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
  }, []);

  return <Component {...pageProps} />;
}
