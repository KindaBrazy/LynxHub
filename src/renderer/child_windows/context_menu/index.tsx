import '@lynx_shared/styles.css';

import HeroUIProvider from '@lynx_shared/HeroUIProvider';
import {createRoot} from 'react-dom/client';
import {Provider as ReduxProvider} from 'react-redux';

import ContextMenu from './App';
import {store} from './redux/store';

createRoot(document.getElementById('root') as HTMLElement).render(
  <ReduxProvider store={store}>
    <HeroUIProvider>
      <ContextMenu />
    </HeroUIProvider>
  </ReduxProvider>,
);
