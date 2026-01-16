import '../../shared/styles.css';
import 'overlayscrollbars/overlayscrollbars.css';

import {createRoot} from 'react-dom/client';

import HeroUIProvider from '../../shared/HeroUIProvider';
import DownloadMenu from './App';

createRoot(document.getElementById('root') as HTMLElement).render(
  <HeroUIProvider>
    <DownloadMenu />
  </HeroUIProvider>,
);
