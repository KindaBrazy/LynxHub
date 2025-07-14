import '../cross_styles.css';

import {createRoot} from 'react-dom/client';

import ToastContent from './ToastContent';

createRoot(document.getElementById('root') as HTMLElement).render(<ToastContent />);
