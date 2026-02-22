import {Button} from '@heroui/react';
import applicationIpc from '@lynx_shared/ipc/application';
import {notification} from 'antd';
import {useEffect} from 'react';

/**
 * Component that listens for custom notification events from the main process
 * and displays them using Ant Design's notification system.
 */
export default function CustomNotification() {
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    const offOpen = applicationIpc.on.onCustomNotifOpen(data => {
      // data.type is one of 'success' | 'info' | 'warning' | 'error'
      api[data.type]({
        closeIcon: null,
        placement: 'bottomRight',
        actions: (
          <div className="flex flex-row gap-x-2">
            {data.buttons?.map(btn => (
              <Button
                size="sm"
                key={btn.id}
                variant="light"
                color={btn.color}
                className={btn.cursor === 'default' ? 'cursor-default' : ''}
                onPress={() => applicationIpc.send.onCustomNotifBtnPress(btn.id, data.key)}>
                {btn.label}
              </Button>
            ))}
            {data.closeBtn && (
              <Button
                size="sm"
                color="warning"
                variant="light"
                className="cursor-default"
                onPress={() => api.destroy(data.key)}>
                Close
              </Button>
            )}
          </div>
        ),
        title: <span className="font-semibold">{data.message}</span>,
        description: data.description,
        duration: 0,
        key: data.key,
        className: 'dark:bg-foreground-100 !shadow-medium !overflow-hidden rounded-xl',
      });
    });
    const offClose = applicationIpc.on.onCustomNotifClose(key => api.destroy(key));

    return () => {
      offOpen();
      offClose();
    };
  }, [api]);

  return <>{contextHolder}</>;
}
