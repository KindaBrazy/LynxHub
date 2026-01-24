import classHolder from '@lynx_main/core/class_holder';
import {addBreadcrumb} from '@sentry/electron/main';

export default function AddBreadcrumb_Main(message: string) {
  const {storageManager} = classHolder;
  if (storageManager.getData('app').addBreadcrumbs) addBreadcrumb({category: 'main-actions', message, level: 'info'});
}
