import '@lynx_shared/styles.css';

import HeroUIProvider from '@lynx_shared/HeroUIProvider';
import {createRoot} from 'react-dom/client';

import App from './App';

/**
 * Entry point for the Share Screen window.
 * Initializes the React application with the HeroUIProvider.
 */
createRoot(document.getElementById('root') as HTMLElement).render(
  <HeroUIProvider>
    <App />
  </HeroUIProvider>,
);
