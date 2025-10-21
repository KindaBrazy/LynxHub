import {extraErrorDataIntegration, init as electronInit} from '@sentry/electron/renderer';
import {init as reactInit} from '@sentry/react';

import {formatTime} from '../cross/CrossUtils';
import rendererIpc from './src/App/RendererIpc';

const {collectErrors} = await rendererIpc.storage.get('app');

if (collectErrors) {
  electronInit(
    {
      beforeBreadcrumb: breadcrumb => {
        return breadcrumb.category === 'ui.click' ? null : breadcrumb;
      },
      integrations: [extraErrorDataIntegration()],
      beforeSend: event => {
        const exception = event.exception?.values?.[0];

        const exceptionValue = exception?.value;
        const isIpcInvokeError = exception?.value?.includes('Error invoking remote method');

        if (isIpcInvokeError) {
          const isNoHandlerRegistered = exceptionValue?.includes("No handler registered for '");

          if (!isNoHandlerRegistered) {
            console.log('Sentry event from IPC invocation handler failure detected. Dropping.');
            return null;
          }
        }

        if (!exception?.stacktrace?.frames) {
          return event;
        }

        const moduleLoadPattern = /\/scripts\/[^/]+\.(?:m?js|ts)/i;

        const extensionLoadPattern = /\/([^/]+)\/scripts\//i;

        const isFromPluginCode = exception.stacktrace.frames.some(frame => {
          if (!frame.filename) return false;

          if (extensionLoadPattern.test(frame.filename)) return true;

          return moduleLoadPattern.test(frame.filename);
        });

        if (isFromPluginCode) {
          console.log('Sentry event from dynamically loaded user code (module or extension) detected. Dropping.');
          return null;
        }

        event.extra = {
          ...event.extra,
          uptime: formatTime(Math.floor((Date.now() - window.appStartTime) / 1000)),
        };

        return event;
      },
    },
    // @ts-ignore
    reactInit,
  );
}
