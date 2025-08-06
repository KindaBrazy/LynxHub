import {Button} from '@heroui/react';
import {notification} from 'antd';
import {useEffect} from 'react';

import rendererIpc from '../../../RendererIpc';

export default function CustomNotification() {
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    rendererIpc.customNotification.onOpen((_, data) => {
      console.log('openeing this', data.key);
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
                onPress={() => rendererIpc.customNotification.btnPress(btn.id, data.key)}>
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
        message: <span className="font-semibold">{data.message}</span>,
        description: data.description,
        duration: 0,
        key: data.key,
        className: 'dark:bg-foreground-100 !shadow-medium !overflow-hidden rounded-xl',
      });
    });
    rendererIpc.customNotification.onClose((_, key) => api.destroy(key));

    return () => {
      rendererIpc.customNotification.offOpen();
      rendererIpc.customNotification.offClose();
    };
  }, []);

  return <>{contextHolder}</>;
}
