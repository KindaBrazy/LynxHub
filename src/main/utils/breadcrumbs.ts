import classHolder from '@lynx_main/managers/classHolder';
import {addBreadcrumb} from '@sentry/electron/main';

/**
 * Adds a breadcrumb to Sentry in the main process if breadcrumbs are enabled in settings.
 *
 * @param message - The breadcrumb message to log
 */
export default function AddBreadcrumb_Main(message: string): void {
  const {storageManager} = classHolder;
  if (storageManager.getData('app').addBreadcrumbs) {
    addBreadcrumb({
      category: 'main-actions',
      message,
      level: 'info',
    });
  }
}
