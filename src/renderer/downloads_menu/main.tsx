import '../cross_styles.css';
import 'overlayscrollbars/overlayscrollbars.css';

import {createRoot} from 'react-dom/client';

import rendererIpc from '../src/App/RendererIpc';
import DownloadMenu from './DownloadMenu';

const {darkMode} = await rendererIpc.storage.get('app');
document.documentElement.className = darkMode ? 'dark' : 'light';

createRoot(document.getElementById('root') as HTMLElement).render(<DownloadMenu />);
