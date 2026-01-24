import './index.css';
import '@xterm/xterm/css/xterm.css';
import 'overlayscrollbars/overlayscrollbars.css';
import '@lynx_shared/sentry/init';

import ErrorWrapper from '@lynx/components/ErrorWrapper';
import {loadExtensions} from '@lynx/plugins/extensions';
import loadModules from '@lynx/plugins/modules';
import {getStorageData, initializeStorage} from '@lynx/redux/storage_init';
import {createStore} from '@lynx/redux/store';
import {isDev} from '@lynx_common/utils';
import {onBreadcrumbStateChange} from '@lynx_shared/sentry/Breadcrumbs';
import {reactErrorHandler} from '@sentry/react';
import log from 'electron-log/renderer';
import {createRoot, RootOptions} from 'react-dom/client';
import {ErrorBoundary} from 'react-error-boundary';
import {Provider as ReduxProvider} from 'react-redux';

import App from './App';

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
    <ErrorBoundary FallbackComponent={ErrorWrapper}>
      <App />
    </ErrorBoundary>
  </ReduxProvider>,
);
