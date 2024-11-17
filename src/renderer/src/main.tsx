import './index.css';
import '@xterm/xterm/css/xterm.css';
import 'overlayscrollbars/overlayscrollbars.css';
import '@mantine/core/styles.css';

import log from 'electron-log/renderer';
import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router-dom';

import {isDev} from '../../cross/CrossUtils';
import {initRouter} from './App/AppRouter';
import {loadExtensions} from './App/Extensions/Vite-Federation';

await loadExtensions();
const router = await initRouter();

if (!isDev()) {
  Object.assign(console, log.functions);
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={router} future={{v7_startTransition: true}} />,
);
