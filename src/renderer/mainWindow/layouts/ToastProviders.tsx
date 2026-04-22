import {DEFAULT_TOAST_TIMEOUT, Toast, ToastQueue} from '@heroui-v3/react';
import {memo} from 'react';

const bottomQueue = new ToastQueue({maxVisibleToasts: 3});
const topQueue = new ToastQueue({maxVisibleToasts: 3});

// Helper function to create toast
function createToastFunction(queue) {
  const toastFn = (message, options?) => {
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
  toastFn.success = (message, options?) => {
    return toastFn(message, {
      ...options,
      variant: 'success',
    });
  };
  toastFn.danger = (message, options?) => {
    return toastFn(message, {
      ...options,
      variant: 'danger',
    });
  };
  toastFn.info = (message, options?) => {
    return toastFn(message, {
      ...options,
      variant: 'accent',
    });
  };
  toastFn.warning = (message, options?) => {
    return toastFn(message, {
      ...options,
      variant: 'warning',
    });
  };

  // Promise support
  toastFn.promise = (promise, options?) => {
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
      .catch(error => {
        const errorMessage = typeof options.error === 'function' ? options.error(error) : options.error;
        queue.close(loadingId);
        return toastFn.danger(errorMessage);
      });
    return loadingId;
  };

  // Expose queue methods for advanced usage
  toastFn.getQueue = () => queue.getQueue();
  toastFn.close = key => queue.close(key);
  toastFn.pauseAll = () => queue.pauseAll();
  toastFn.resumeAll = () => queue.resumeAll();
  toastFn.clear = () => queue.clear();
  return toastFn;
}

const bottomToast = createToastFunction(bottomQueue);
const topToast = createToastFunction(topQueue);

const ToastProviders = memo(() => {
  return (
    <>
      <Toast.Provider placement="top" queue={topQueue} className="top-11" />
      <Toast.Provider queue={bottomQueue} placement="bottom end" />
    </>
  );
});

export default ToastProviders;
export {bottomToast, topToast};
