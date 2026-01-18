import '../../shared/styles.css';

import HeroUIProvider from '@lynx_shared/HeroUIProvider';
import {createRoot} from 'react-dom/client';

import ContextMenu from './App';

createRoot(document.getElementById('root') as HTMLElement).render(
  <HeroUIProvider>
    <ContextMenu />
  </HeroUIProvider>,
);
