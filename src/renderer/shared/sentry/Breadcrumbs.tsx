import actionsIpc from '@lynx_shared/ipc/actions';
import {isEmpty} from 'lodash-es';
import {DependencyList, useEffect} from 'react';

let isEnabled: boolean = true;

/**
 * Enables or disables renderer breadcrumb collection at runtime.
 */
export function onBreadcrumbStateChange(enabled: boolean) {
  isEnabled = enabled;
}

/**
 * Adds an informational renderer breadcrumb when breadcrumb collection is enabled.
 */
export default function AddBreadcrumb_Renderer(message: string) {
  if (isEnabled) {
    actionsIpc.logAction({category: 'renderer-actions', message, level: 'info'});
  }
}

/**
 * Debounces breadcrumb emission for frequently changing UI state.
 *
 * A breadcrumb is emitted after 2 seconds when at least one dependency value
 * is non-empty.
 */
export function useDebounceBreadcrumb(message: string, deps: DependencyList) {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!deps.every(isEmpty)) {
        AddBreadcrumb_Renderer(`${message}: ${serializeDependencies(deps)}`);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [message, ...deps]);
}

/**
 * Safely serializes dependency values for breadcrumb payloads.
 */
function serializeDependencies(deps: DependencyList): string {
  try {
    return JSON.stringify(deps);
  } catch {
    return '"[unserializable-deps]"';
  }
}
