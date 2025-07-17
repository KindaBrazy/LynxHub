import {addBreadcrumb} from '@sentry/electron/renderer';
import {isEmpty} from 'lodash';
import {useEffect} from 'react';

let isEnabled: boolean = true;

export function onBreadcrumbStateChange(enabled: boolean) {
  isEnabled = enabled;
}

export default function AddBreadcrumb_Renderer(message: string) {
  if (isEnabled) addBreadcrumb({category: 'renderer-actions', message, level: 'info'});
}

export function useDebounceBreadcrumb(message: string, ...deps: any[]) {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!deps.every(isEmpty)) AddBreadcrumb_Renderer(`${message}: ${JSON.stringify(deps)}`);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, deps);
}
