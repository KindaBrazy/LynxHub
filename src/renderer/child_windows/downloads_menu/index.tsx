import '../../shared/styles.css';
import 'overlayscrollbars/overlayscrollbars.css';

import {createRoot} from 'react-dom/client';

import HeroUIProvider from '../../shared/HeroUIProvider';
import DownloadMenu from '../context_menu/layouts/downloads';

createRoot(document.getElementById('root') as HTMLElement).render(
  <HeroUIProvider>
    <DownloadMenu />
  </HeroUIProvider>,
);
