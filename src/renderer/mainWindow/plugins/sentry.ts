import {BrowserClient, defaultStackParser, getDefaultIntegrations, makeFetchTransport, Scope} from '@sentry/browser';

/**
 * Initializes an isolated Sentry `BrowserClient` scoped to a single plugin's
 * browser-side code.
 *
 * Each plugin gets its own `Scope` so that errors it reports are attributed to
 * the plugin's own DSN rather than the host application's. Three default
 * integrations are intentionally excluded:
 *
 * - **BrowserApiErrors** — would capture unhandled errors from browser APIs,
 *   which could bleed over from unrelated code in the same window.
 * - **Breadcrumbs** — avoids noisy breadcrumb capture that isn't scoped to the
 *   plugin.
 * - **GlobalHandlers** — prevents the plugin from installing a global
 *   `window.onerror` that would intercept host-application errors.
 *
 * @param dsn - The Sentry Data Source Name for the plugin's Sentry project.
 * @returns An initialized `Scope` the plugin can use to capture exceptions.
 */
export function initPluginBrowserSentry(dsn: string): Scope {
  const EXCLUDED_INTEGRATIONS = ['BrowserApiErrors', 'Breadcrumbs', 'GlobalHandlers'];

  const integrations = getDefaultIntegrations({}).filter(
    integration => !EXCLUDED_INTEGRATIONS.includes(integration.name),
  );

  const client = new BrowserClient({
    dsn,
    transport: makeFetchTransport,
    stackParser: defaultStackParser,
    integrations,
  });

  const scope = new Scope();
  scope.setClient(client);
  client.init();

  return scope;
}
