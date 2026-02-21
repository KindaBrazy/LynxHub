import '@lynx_shared/styles.css';

import {createRoot} from 'react-dom/client';

import LinkPreview from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

/**
 * Entry point for the Link Preview window.
 */
createRoot(rootElement).render(<LinkPreview />);
