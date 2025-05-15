import {Button} from '@heroui/react';

import {Stop_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {useHotkeysState} from '../../../Redux/Reducer/HotkeysReducer';
import {useSettingsState} from '../../../Redux/Reducer/SettingsReducer';
import rendererIpc from '../../../RendererIpc';

type Props = {id: string};

export default function Terminate_AI({id}: Props) {
  const isCtrlPressed = useHotkeysState('isCtrlPressed');
  const showTerminateConfirm = useSettingsState('terminateAIConfirm');

  const stopAi = () => {
    if (id) {
      if (isCtrlPressed || !showTerminateConfirm) {
        rendererIpc.contextMenu.stopAI(id);
      } else {
        rendererIpc.contextMenu.openTerminateAI(id);
      }
    }
  };

  return (
    <Button size="sm" variant="light" onPress={stopAi} className="cursor-default" isIconOnly>
      <Stop_Icon className="size-4 text-danger" />
    </Button>
  );
}
