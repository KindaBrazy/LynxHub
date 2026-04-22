import '@lynx_shared/styles.css';

import {createRoot} from 'react-dom/client';

import ToastContent from './App';

/**
 * Entry point for the Toast Window.
 * Initializes the React application with the HeroUIProvider.
 */
createRoot(document.getElementById('root') as HTMLElement).render(<ToastContent />);
