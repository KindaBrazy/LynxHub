import '../cross_styles.css';

import {createRoot} from 'react-dom/client';

import HeroProvider from '../HeroProvider';
import App from './ScreenShare';

createRoot(document.getElementById('root') as HTMLElement).render(
  <HeroProvider>
    <App />
  </HeroProvider>,
);
