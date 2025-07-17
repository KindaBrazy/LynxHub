import {addBreadcrumb} from '@sentry/electron/main';

import {storageManager} from '../index';

export default function AddBreadcrumb_Main(message: string) {
  if (storageManager.getData('app').addBreadcrumbs) addBreadcrumb({category: 'main-actions', message, level: 'info'});
}
