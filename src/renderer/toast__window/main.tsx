import '../cross_styles.css';
import '../SentryInit';

import {createRoot} from 'react-dom/client';

import ToastContent from './ToastContent';

createRoot(document.getElementById('root') as HTMLElement).render(<ToastContent />);
