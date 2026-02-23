import {Button, Tooltip} from '@heroui/react';
import {useHotkeysState} from '@lynx/redux/reducers/hotkeys';
import {useSettingsState} from '@lynx/redux/reducers/settings';
import {Stop_Icon} from '@lynx_assets/icons';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {memo, useCallback} from 'react';

type Props = {
  /**
   * The ID of the process/card to terminate.
   */
  id: string;
};

/**
 * A button to terminate the running AI/process.
 * Checks for confirmation settings and hotkeys.
 */
const TerminateProcessButton = memo(({id}: Props) => {
  const isCtrlPressed = useHotkeysState('isCtrlPressed');
  const showTerminateConfirm = useSettingsState('terminateAIConfirm');

  const handleStop = useCallback(() => {
    if (!id) return;

    if (isCtrlPressed || !showTerminateConfirm) {
      contextMenuIpc.send.stopAI(id);
    } else {
      contextMenuIpc.send.openTerminateProcess(id);
    }
  }, [id, isCtrlPressed, showTerminateConfirm]);

  return (
    <Tooltip delay={500} content="Terminate Process">
      <Button
        size="sm"
        variant="light"
        onPress={handleStop}
        className="cursor-default"
        aria-label="Terminate Process"
        isIconOnly>
        <Stop_Icon className="size-4 text-danger" />
      </Button>
    </Tooltip>
  );
});

TerminateProcessButton.displayName = 'TerminateProcessButton';

export default TerminateProcessButton;
