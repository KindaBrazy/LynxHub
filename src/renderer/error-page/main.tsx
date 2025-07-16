import '../cross_styles.css';
import '../SentryInit';

import {createRoot} from 'react-dom/client';

import ErrorPage from './ErrorPage';

createRoot(document.getElementById('root') as HTMLElement).render(<ErrorPage />);
