import '../../shared/styles.css';

import {createRoot} from 'react-dom/client';

import HeroUIProvider from '../../shared/HeroUIProvider';
import App from './App';

createRoot(document.getElementById('root') as HTMLElement).render(
  <HeroUIProvider>
    <App />
  </HeroUIProvider>,
);
