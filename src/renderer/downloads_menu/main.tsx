import '../cross_styles.css';
import 'overlayscrollbars/overlayscrollbars.css';

import {createRoot} from 'react-dom/client';

import HeroProvider from '../HeroProvider';
import DownloadMenu from './DownloadMenu';

createRoot(document.getElementById('root') as HTMLElement).render(
  <HeroProvider>
    <DownloadMenu />
  </HeroProvider>,
);
