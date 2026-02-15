import {Button} from '@heroui/react';
import {useHotkeysState} from '@lynx/redux/reducers/hotkeys';
import {useSettingsState} from '@lynx/redux/reducers/settings';
import {Stop_Icon} from '@lynx_assets/icons';
import contextMenuIpc from '@lynx_shared/ipc/context_menu';

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
