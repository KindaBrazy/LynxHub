import type {ButtonProps, ToastContentValue, ToastQueue} from '@heroui/react';
import {DEFAULT_TOAST_TIMEOUT} from '@heroui/react';
import type {ReactNode} from 'react';

interface HeroUIToastOptions {
  description?: ReactNode;
  indicator?: ReactNode;
  variant?: ToastContentValue['variant'];
  actionProps?: ButtonProps;
  isLoading?: boolean;
  timeout?: number;
  onClose?: () => void;
}

interface ToastPromiseOptions<T = unknown> {
  loading: ReactNode;
  success: ((data: T) => ReactNode) | ReactNode;
  error: ((error: Error) => ReactNode) | ReactNode;
}

// Helper function to create toast
export default function createToastFunction(queue: ToastQueue) {
  const toastFn = (message: ReactNode, options?: HeroUIToastOptions): string => {
    // Use default timeout if not provided, but respect explicit 0 (persistent toast)
    const timeout = options?.timeout !== undefined ? options.timeout : DEFAULT_TOAST_TIMEOUT;

    return queue.add(
      {
        title: message,
        description: options?.description,
        indicator: options?.indicator,
        variant: options?.variant || 'default',
        actionProps: options?.actionProps,
        isLoading: options?.isLoading,
      },
      {
        timeout,
        onClose: () => {
          requestAnimationFrame(() => {
            options?.onClose?.();
          });
        },
      },
    );
  };

  // Variant methods
  toastFn.success = (message: ReactNode, options?: Omit<HeroUIToastOptions, 'variant'>): string => {
    return toastFn(message, {...options, variant: 'success'});
  };

  toastFn.danger = (message: ReactNode, options?: Omit<HeroUIToastOptions, 'variant'>): string => {
    return toastFn(message, {...options, variant: 'danger'});
  };

  toastFn.info = (message: ReactNode, options?: Omit<HeroUIToastOptions, 'variant'>): string => {
    return toastFn(message, {...options, variant: 'accent'});
  };

  toastFn.warning = (message: ReactNode, options?: Omit<HeroUIToastOptions, 'variant'>): string => {
    return toastFn(message, {...options, variant: 'warning'});
  };

  // Promise support
  toastFn.promise = <T>(promise: Promise<T> | (() => Promise<T>), options: ToastPromiseOptions<T>): string => {
    const promiseFn = typeof promise === 'function' ? promise() : promise;
    const loadingId = queue.add(
      {
        title: options.loading,
        variant: 'default',
        isLoading: true,
      },
      {
        timeout: 0, // Don't auto-close loading toasts
      },
    );

    promiseFn
      .then(data => {
        const successMessage = typeof options.success === 'function' ? options.success(data) : options.success;

        queue.close(loadingId);

        return toastFn.success(successMessage);
      })
      .catch((error: Error) => {
        const errorMessage = typeof options.error === 'function' ? options.error(error) : options.error;

        queue.close(loadingId);

        return toastFn.danger(errorMessage);
      });

    return loadingId;
  };

  // Expose queue methods for advanced usage
  toastFn.getQueue = () => queue.getQueue();
  toastFn.close = (key: string) => queue.close(key);
  toastFn.pauseAll = () => queue.pauseAll();
  toastFn.resumeAll = () => queue.resumeAll();
  toastFn.clear = () => queue.clear();

  return toastFn as typeof toastFn & {
    success: typeof toastFn.success;
    danger: typeof toastFn.danger;
    info: typeof toastFn.info;
    warning: typeof toastFn.warning;
    promise: typeof toastFn.promise;
    getQueue: () => ReturnType<typeof queue.getQueue>;
    close: typeof queue.close;
    pauseAll: typeof queue.pauseAll;
    resumeAll: typeof queue.resumeAll;
    clear: typeof queue.clear;
  };
}

export type ToastMethod = typeof createToastFunction;
export type ToastFunction = ReturnType<typeof createToastFunction>;
