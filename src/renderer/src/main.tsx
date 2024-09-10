import './index.css';
import '@xterm/xterm/css/xterm.css';
import 'overlayscrollbars/overlayscrollbars.css';
import '@mantine/core/styles.css';

import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router-dom';

import {initRouter} from './App/AppRouter';

const router = await initRouter();

createRoot(document.getElementById('root') as HTMLElement).render(<RouterProvider router={router} />);
