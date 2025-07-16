import '../cross_styles.css';
import '../SentryInit';

import {createRoot} from 'react-dom/client';

import App from './Dialog';

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
