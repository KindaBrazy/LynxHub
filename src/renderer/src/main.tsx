import './index.css';
import '@xterm/xterm/css/xterm.css';
import 'overlayscrollbars/overlayscrollbars.css';
import '../SentryInit';

import {reactErrorHandler} from '@sentry/react';
import log from 'electron-log/renderer';
import {createRoot, RootOptions} from 'react-dom/client';
import {ErrorBoundary} from 'react-error-boundary';
import {Provider as ReduxProvider} from 'react-redux';

import {isDev} from '../../cross/CrossUtils';
import {onBreadcrumbStateChange} from '../Breadcrumbs';
import App from './App/App';
import {loadExtensions} from './App/Extensions/Vite-Federation';
import loadModules from './App/Modules/ModuleLoader';
import {getStorageData, initializeStorage} from './App/Redux/StorageInit';
import {createStore} from './App/Redux/Store';
import ErrorComponent from './ErrorComponent';

// Initialize storage first (single IPC call for all data)
await initializeStorage();

// Now load modules and extensions
await loadModules();
await loadExtensions();

// Get app settings from cached storage
const storage = getStorageData()!;
const {collectErrors, addBreadcrumbs} = storage.app;

onBreadcrumbStateChange(addBreadcrumbs);

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
