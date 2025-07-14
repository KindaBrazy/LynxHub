import '../cross_styles.css';

import {createRoot} from 'react-dom/client';

import ErrorPage from './ErrorPage';

createRoot(document.getElementById('root') as HTMLElement).render(<ErrorPage />);
