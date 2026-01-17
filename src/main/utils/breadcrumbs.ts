import {addBreadcrumb} from '@sentry/electron/main';

import classHolder from '../core/class_holder';

export default function AddBreadcrumb_Main(message: string) {
  const {storageManager} = classHolder;
  if (storageManager.getData('app').addBreadcrumbs) addBreadcrumb({category: 'main-actions', message, level: 'info'});
}
