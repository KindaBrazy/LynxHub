import {BrowserClient, defaultStackParser, getDefaultIntegrations, makeFetchTransport, Scope} from '@sentry/browser';

export function initPluginBrowserSentry(dsn: string) {
  const integrations = getDefaultIntegrations({}).filter(defaultIntegration => {
    return !['BrowserApiErrors', 'Breadcrumbs', 'GlobalHandlers'].includes(defaultIntegration.name);
  });

  const client = new BrowserClient({
    dsn,
    transport: makeFetchTransport,
    stackParser: defaultStackParser,
    integrations: integrations,
  });

  const scope = new Scope();
  scope.setClient(client);
  client.init();

  return scope;
}
