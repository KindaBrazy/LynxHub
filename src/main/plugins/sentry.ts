import {defaultStackParser, getDefaultIntegrations, makeNodeTransport, NodeClient, Scope} from '@sentry/node';

export function initPluginNodeSentry(dsn: string) {
  const integrations = getDefaultIntegrations({}).filter(defaultIntegration => {
    return !['BrowserApiErrors', 'Breadcrumbs', 'GlobalHandlers'].includes(defaultIntegration.name);
  });

  const client = new NodeClient({
    dsn,
    transport: makeNodeTransport,
    stackParser: defaultStackParser,
    integrations: integrations,
  });

  const scope = new Scope();
  scope.setClient(client);
  client.init();

  return scope;
}
