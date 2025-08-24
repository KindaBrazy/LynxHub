import '../cross_styles.css';

import {createRoot} from 'react-dom/client';

import rendererIpc from '../src/App/RendererIpc';
import App from './ScreenShare';

const {darkMode} = await rendererIpc.storage.get('app');
const systemDarkMode = await rendererIpc.win.getSystemDarkMode();

let isDarkMode = true;

if (darkMode === 'system') {
  isDarkMode = systemDarkMode === 'dark';
} else {
  isDarkMode = darkMode === 'dark';
}

createRoot(document.getElementById('root') as HTMLElement).render(<App isDarkMode={isDarkMode} />);
