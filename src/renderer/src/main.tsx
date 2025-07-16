import './index.css';
import '@xterm/xterm/css/xterm.css';
import 'overlayscrollbars/overlayscrollbars.css';
import '@ant-design/v5-patch-for-react-19';
import '../SentryInit';

import {reactErrorHandler} from '@sentry/react';
import log from 'electron-log/renderer';
import {createRoot, RootOptions} from 'react-dom/client';
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

const {darkMode, collectErrors} = await rendererIpc.storage.get('app');

document.documentElement.className = darkMode ? 'dark' : 'light';

if (!isDev()) {
  Object.assign(console, log.functions);
}

const rootOptions: RootOptions | undefined = collectErrors
  ? {
      onUncaughtError: reactErrorHandler((error, errorInfo) => {
        console.warn('Uncaught error', error, errorInfo.componentStack);
      }),
      onCaughtError: reactErrorHandler(),
      onRecoverableError: reactErrorHandler(),
    }
  : undefined;

createRoot(document.getElementById('root') as HTMLElement, rootOptions).render(
  <ReduxProvider store={createStore(collectErrors)}>
    <ErrorBoundary FallbackComponent={ErrorComponent}>
      <App />
    </ErrorBoundary>
  </ReduxProvider>,
);
