import {logAction} from '@lynx_main/utils/actionLogger';

/**
 * Adds a breadcrumb to the local queue in the main process if breadcrumbs are enabled.
 *
 * @param message - The breadcrumb message to log
 */
export default function AddBreadcrumb_Main(message: string): void {
  logAction('main-actions', message);
}
