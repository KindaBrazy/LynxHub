import '@lynx_shared/styles.css';

import HeroUIProvider from '@lynx_shared/HeroUIProvider';
import {createRoot} from 'react-dom/client';
import {Provider as ReduxProvider} from 'react-redux';

import ContextMenu from './App';
import {store} from './redux/store';

// Initialize React application
const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <ReduxProvider store={store}>
      <HeroUIProvider>
        <ContextMenu />
      </HeroUIProvider>
    </ReduxProvider>,
  );
} else {
  console.error('Failed to find the root element');
}
