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
            <Toast toast={toastItem} variant={content.variant} className="border notDraggable">
              <ToastContent>
                <div className="flex items-center gap-2">
                  <ToastIndicator variant={content.variant} />
                  <div className="flex flex-col pr-6">
                    {content.title ? <ToastTitle>{content.title}</ToastTitle> : null}
                    {content.description ? <ToastDescription>{content.description}</ToastDescription> : null}
                  </div>
                </div>
              </ToastContent>
              <Toast.CloseButton className={'notDraggable'} />
            </Toast>
          );
        }}
      </Toast.Provider>
      <Toast.Provider queue={bottomQueue} placement="bottom end">
        {({toast: toastItem}) => {
          const content = toastItem.content as ToastContentValue;
          return (
            <Toast toast={toastItem} className="border" variant={content.variant}>
              <ToastContent>
                <div className="flex items-center gap-2">
                  <ToastIndicator variant={content.variant} />
                  <div className="flex flex-col pr-6">
                    {content.title ? <ToastTitle>{content.title}</ToastTitle> : null}
                    {content.description ? <ToastDescription>{content.description}</ToastDescription> : null}
                  </div>
                </div>
              </ToastContent>
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
