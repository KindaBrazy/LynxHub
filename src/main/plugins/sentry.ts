import {defaultStackParser, getDefaultIntegrations, makeNodeTransport, NodeClient, Scope} from '@sentry/node';

/**
 * Initializes Sentry for a plugin in the Node.js environment.
 * @param dsn - The Sentry DSN (Data Source Name).
 * @returns The initialized Sentry scope.
 */
export function initPluginNodeSentry(dsn: string): Scope {
  const integrations = getDefaultIntegrations({}).filter(defaultIntegration => {
    return !['BrowserApiErrors', 'Breadcrumbs', 'GlobalHandlers'].includes(defaultIntegration.name);
  });

  const client = new NodeClient({
    dsn,
    transport: makeNodeTransport,
    stackParser: defaultStackParser,
    integrations,
  });

  const scope = new Scope();
  scope.setClient(client);
  client.init();

  return scope;
}
