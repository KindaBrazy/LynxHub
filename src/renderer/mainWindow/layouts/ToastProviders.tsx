import {
  Toast,
  ToastContent,
  ToastContentValue,
  ToastDescription,
  ToastIndicator,
  ToastQueue,
  ToastTitle,
} from '@heroui/react';
import createToastFunction, {ToastFunction} from '@lynx_common/utils/toast';
import {memo} from 'react';

const bottomQueue = new ToastQueue({maxVisibleToasts: 3});
const topQueue = new ToastQueue({maxVisibleToasts: 3});

const topToast: ToastFunction = createToastFunction(topQueue);
const bottomToast: ToastFunction = createToastFunction(bottomQueue);

const ToastProviders = memo(() => {
  return (
    <>
      <Toast.Provider placement="top" queue={topQueue}>
        {({toast: toastItem}) => {
          const content = toastItem.content as ToastContentValue;
          return (
            <Toast placement="top" toast={toastItem} variant={content.variant} className="border notDraggable">
              <ToastIndicator variant={content.variant} />
              <ToastContent className="min-w-0 pr-4">
                {content.title ? <ToastTitle>{content.title}</ToastTitle> : null}
                {content.description ? <ToastDescription>{content.description}</ToastDescription> : null}
              </ToastContent>
              {content.actionProps ? <Toast.ActionButton {...content.actionProps} /> : null}
              <Toast.CloseButton className={'notDraggable'} />
            </Toast>
          );
        }}
      </Toast.Provider>
      <Toast.Provider queue={bottomQueue} placement="bottom end">
        {({toast: toastItem}) => {
          const content = toastItem.content as ToastContentValue;
          return (
            <Toast toast={toastItem} placement="bottom end" variant={content.variant} className="border py-4 px-5">
              <ToastIndicator variant={content.variant} />
              <ToastContent className="min-w-0 pr-4">
                {content.title ? <ToastTitle>{content.title}</ToastTitle> : null}
                {content.description ? <ToastDescription>{content.description}</ToastDescription> : null}
              </ToastContent>
              {content.actionProps ? <Toast.ActionButton {...content.actionProps} /> : null}
              <Toast.CloseButton />
            </Toast>
          );
        }}
      </Toast.Provider>
    </>
  );
});

export default ToastProviders;

export {bottomToast, topToast};
