import {extraErrorDataIntegration, init as electronInit} from '@sentry/electron/renderer';
import {init as reactInit} from '@sentry/react';

import rendererIpc from './src/App/RendererIpc';

const {collectErrors} = await rendererIpc.storage.get('app');

if (collectErrors) {
  electronInit(
    {
      beforeBreadcrumb: breadcrumb => {
        return breadcrumb.category === 'ui.click' ? null : breadcrumb;
      },
      integrations: [extraErrorDataIntegration()],
    },
    reactInit,
  );
}
