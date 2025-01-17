import {Button} from '@heroui/react';
import {notification} from 'antd';

import rendererIpc from '../RendererIpc';

export const checkEARepos = (isEA: boolean) => {
  rendererIpc.extension.checkEa(isEA).then(eEA => {
    rendererIpc.module.checkEa(isEA).then(mEA => {
      if (eEA || mEA) {
        notification.info({
          duration: 0,
          key: 'need_restart',
          message: 'Configuration Updated',
          closable: false,
          description: "The application's configuration has been updated. Please restart for changes to be applied.",
          btn: (
            <div className="flex flex-row gap-x-2">
              <Button
                size="sm"
                variant="light"
                color="success"
                onPress={() => rendererIpc.win.changeWinState('restart')}>
                Restart
              </Button>
              <Button size="sm" variant="light" color="warning" onPress={() => notification.destroy('need_restart')}>
                Do It Later
              </Button>
            </div>
          ),
        });
      }
    });
  });
};