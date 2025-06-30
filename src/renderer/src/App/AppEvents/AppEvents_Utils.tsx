import {Button} from '@heroui/react';
import {notification} from 'antd';

import rendererIpc from '../RendererIpc';
import {isLinuxPortable} from '../Utils/UtilHooks';

export const checkEARepos = (isEA: boolean, isInsider: boolean) => {
  rendererIpc.extension
    .checkEa(isEA, isInsider)
    .then(eEA => {
      rendererIpc.module
        .checkEa(isEA, isInsider)
        .then(mEA => {
          if (eEA || mEA) {
            notification.info({
              duration: 0,
              key: 'need_restart',
              message: 'Update Stage Changed',
              closable: false,
              description:
                `The extensions and modules updates has been changed to ` +
                `${isEA ? 'Early Access' : isInsider ? 'Insider' : 'Normal'}` +
                ` stage. Please restart for changes to be applied.`,
              actions: (
                <div className="flex flex-row gap-x-2">
                  <Button
                    size="sm"
                    variant="light"
                    color="success"
                    onPress={() => rendererIpc.win.changeWinState(isLinuxPortable ? 'close' : 'restart')}>
                    {isLinuxPortable ? 'Exit' : 'Restart'}
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    color="warning"
                    onPress={() => notification.destroy('need_restart')}>
                    Do It Later
                  </Button>
                </div>
              ),
            });
          }
        })
        .catch(console.error);
    })
    .catch(console.error);
};
