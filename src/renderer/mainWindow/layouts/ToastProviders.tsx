import {Toast, ToastQueue} from '@heroui-v3/react';
import createToastFunction, {ToastFunction} from '@lynx_common/utils/toast';
import {memo} from 'react';

const bottomQueue = new ToastQueue({maxVisibleToasts: 3});
const topQueue = new ToastQueue({maxVisibleToasts: 3});

const topToast: ToastFunction = createToastFunction(topQueue);
const bottomToast: ToastFunction = createToastFunction(bottomQueue);

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
