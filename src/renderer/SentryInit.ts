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
        event.extra = {
          ...event.extra,
          uptime: formatTime(Math.floor((Date.now() - window.appStartTime) / 1000)),
        };
        return event;
      },
    },
    reactInit,
  );
}
