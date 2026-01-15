import '../cross_styles.css';

import {createRoot} from 'react-dom/client';

import HeroProvider from '../HeroProvider';
import ContextMenu from './ContextMenu';

createRoot(document.getElementById('root') as HTMLElement).render(
  <HeroProvider>
    <ContextMenu />
  </HeroProvider>,
);
