import {Button} from '@heroui/react';
import {notification} from 'antd';

import {SubscribeStages} from '../../../../cross/CrossTypes';
import rendererIpc from '../RendererIpc';
import {isLinuxPortable} from '../Utils/UtilHooks';

const stageDisplayNames: Record<SubscribeStages, string> = {
  insider: 'Insider',
  early_access: 'Early Access',
  public: 'Public',
};

export const checkSubscribeStage = (stage: SubscribeStages) => {
  rendererIpc.plugins.checkStage(stage).then(isStageChanged => {
    if (isStageChanged) {
      const newStageName = stageDisplayNames[stage];

      notification.info({
        duration: 0,
        key: 'need_restart',
        message: 'Update Channel Changed',
        closable: false,
        description:
          `Update channel has been switched to **${newStageName}**.` +
          ` A restart is required for this change to take full effect.`,
        actions: (
          <div className="flex flex-row gap-x-2">
            <Button
              size="sm"
              variant="light"
              color="success"
              onPress={() => rendererIpc.win.changeWinState(isLinuxPortable ? 'close' : 'restart')}>
              {isLinuxPortable ? 'Exit Now' : 'Restart Now'}
            </Button>
            <Button size="sm" variant="light" color="warning" onPress={() => notification.destroy('need_restart')}>
              Later
            </Button>
          </div>
        ),
      });
    }
  });
};
