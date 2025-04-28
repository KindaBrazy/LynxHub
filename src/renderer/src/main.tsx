import './index.css';
import '@xterm/xterm/css/xterm.css';
import 'overlayscrollbars/overlayscrollbars.css';
import '@ant-design/v5-patch-for-react-19';

import log from 'electron-log/renderer';
import {createRoot} from 'react-dom/client';
import {ErrorBoundary} from 'react-error-boundary';
import {Provider as ReduxProvider} from 'react-redux';

import {isDev} from '../../cross/CrossUtils';
import App from './App/App';
import {loadExtensions} from './App/Extensions/Vite-Federation';
import loadModules from './App/Modules/ModuleLoader';
import {createStore} from './App/Redux/Store';
import rendererIpc from './App/RendererIpc';
import ErrorComponent from './ErrorComponent';

await loadModules();
await loadExtensions();

const {darkMode} = await rendererIpc.storage.get('app');
document.documentElement.className = darkMode ? 'dark' : 'light';

if (!isDev()) {
  Object.assign(console, log.functions);
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <ReduxProvider store={createStore()}>
    <ErrorBoundary FallbackComponent={ErrorComponent}>
      <App />
    </ErrorBoundary>
  </ReduxProvider>,
);
