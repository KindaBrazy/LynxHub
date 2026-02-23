import {formatTime} from '@lynx_common/utils';
import storageIpc from '@lynx_shared/ipc/storage';
import {extraErrorDataIntegration, init as electronInit} from '@sentry/electron/renderer';
import {init as reactInit} from '@sentry/react';

const MODULE_LOAD_PATTERN = /\/scripts\/[^/]+\.(?:m?js|ts)/i;
const EXTENSION_LOAD_PATTERN = /\/([^/]+)\/scripts\//i;

const {collectErrors} = await storageIpc.get('app');

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
        const isIpcInvokeError = exceptionValue?.includes('Error invoking remote method');

        if (isIpcInvokeError) {
          const isNoHandlerRegistered = exceptionValue?.includes("No handler registered for '") ?? false;

          if (!isNoHandlerRegistered) {
            console.log('Sentry event from IPC invocation handler failure detected. Dropping.');
            return null;
          }
        }

        if (!exception?.stacktrace?.frames) {
          return event;
        }

        const isFromPluginCode = exception.stacktrace.frames.some(frame => {
          if (!frame.filename) return false;

          if (EXTENSION_LOAD_PATTERN.test(frame.filename)) return true;

          return MODULE_LOAD_PATTERN.test(frame.filename);
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
    // @ts-ignore-next-line
    reactInit,
  );
}
