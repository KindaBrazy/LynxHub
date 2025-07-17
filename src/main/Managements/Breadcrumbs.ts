import {addBreadcrumb} from '@sentry/electron/main';

export default function AddBreadcrumb_Main(message: string) {
  addBreadcrumb({category: 'main-actions', message, level: 'info'});
}
