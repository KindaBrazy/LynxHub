import '../cross_styles.css';

import {createRoot} from 'react-dom/client';

import rendererIpc from '../src/App/RendererIpc';
import LinkPreview from './LinkPreview';

createRoot(document.getElementById('root') as HTMLElement).render(<LinkPreview />);
