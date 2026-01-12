import {addBreadcrumb} from '@sentry/electron/main';

import getClassHolder from './ClassHolder';

export default function AddBreadcrumb_Main(message: string) {
  const {storageManager} = getClassHolder();
  if (storageManager.getData('app').addBreadcrumbs) addBreadcrumb({category: 'main-actions', message, level: 'info'});
}
