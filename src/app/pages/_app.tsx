import 'primereact/resources/themes/saga-blue/theme.css';  // or any PrimeReact theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import '../styles/globals.css';

import type { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  // Add providers/context if needed
  return <Component {...pageProps} />;
}