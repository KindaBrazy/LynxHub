import './index.css';

import {createRoot} from 'react-dom/client';

import rendererIpc from '../src/App/RendererIpc';
import App from './ContextMenu';

const {darkMode} = await rendererIpc.storage.get('app');
document.documentElement.className = darkMode ? 'dark' : 'light';

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
