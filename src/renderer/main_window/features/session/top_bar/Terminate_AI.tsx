import {Button} from '@heroui/react';
import {Stop_Icon} from '@lynx_assets/icons';
import contextMenuIpc from '@lynx_shared/ipc/context_menu';

import {useHotkeysState} from '../../../redux/reducers/hotkeys';
import {useSettingsState} from '../../../redux/reducers/settings';

type Props = {id: string};

export default function Terminate_AI({id}: Props) {
  const isCtrlPressed = useHotkeysState('isCtrlPressed');
  const showTerminateConfirm = useSettingsState('terminateAIConfirm');

  const stopAi = () => {
    if (id) {
      if (isCtrlPressed || !showTerminateConfirm) {
        contextMenuIpc.send.stopAI(id);
      } else {
        contextMenuIpc.send.openTerminateProcess(id);
      }
    }
  };

  return (
    <Button size="sm" variant="light" onPress={stopAi} className="cursor-default" isIconOnly>
      <Stop_Icon className="size-4 text-danger" />
    </Button>
  );
}
