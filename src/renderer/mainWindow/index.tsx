import './index.css';
import '@xterm/xterm/css/xterm.css';
import '@lynx_shared/sentry/init';

import {isDev} from '@lynx_common/utils';
import {onBreadcrumbStateChange} from '@lynx_shared/sentry/Breadcrumbs';
import {reactErrorHandler} from '@sentry/react';
import log from 'electron-log/renderer';
import type {RootOptions} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {ErrorBoundary} from 'react-error-boundary';
import {Provider as ReduxProvider} from 'react-redux';

import App from './App';
import ErrorWrapper from './components/ErrorWrapper';
import {loadExtensions} from './plugins/extensions';
import loadModules from './plugins/modules';
import {getStorageData, initializeStorage} from './redux/storageInit';
import {createStore} from './redux/store';

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

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element with id "root" was not found.');
}

createRoot(rootElement, rootOptions).render(
  <ReduxProvider store={createStore(collectErrors)}>
    <ErrorBoundary FallbackComponent={ErrorWrapper}>
      <App />
    </ErrorBoundary>
  </ReduxProvider>,
);
