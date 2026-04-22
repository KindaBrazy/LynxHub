import {Button, Tooltip} from '@heroui/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import filesIpc from '@lynx_shared/ipc/files';
import {FileText} from '@solar-icons/react-perf/BoldDuotone';
import {SerializeAddon} from '@xterm/addon-serialize';
import {memo, useCallback} from 'react';

import CopyClipboard from '../../../../components/CopyClipboard';

type Props = {
  /**
   * The serialize addon for xterm.js.
   */
  serializeAddon: SerializeAddon;
};

/**
 * Buttons to copy terminal content to clipboard or save to file.
 */
const TerminalCopyAll = memo(({serializeAddon}: Props) => {
  const handleCopy = useCallback(() => {
    const contentToCopy = serializeAddon.serialize();
    if (!contentToCopy) return;

    try {
      navigator.clipboard.writeText(contentToCopy);
    } catch (e) {
      topToast.danger('Failed to copy terminal text to clipboard!');
    }
  }, [serializeAddon]);

  const saveFile = useCallback(() => {
    const contentToSave = serializeAddon.serialize();
    if (!contentToSave) {
      topToast.warning('Failed get terminal text to save!');
      return;
    }

    filesIpc
      .saveToFile(contentToSave)
      .then(result => {
        if (result) topToast.success(`Successfully saved terminal data.`);
      })
      .catch(() => topToast.danger('Failed to save terminal text to file!'));
  }, [serializeAddon]);

  return (
    <div className="flex flex-row items-center gap-x-1">
      <CopyClipboard onCopy={handleCopy} tooltipTitle="Copy all to clipboard" />

      <Tooltip delay={500} content="Export all to file">
        <Button size="sm" variant="light" onPress={saveFile} aria-label="Export all to file" isIconOnly>
          <FileText className="size-3.5" />
        </Button>
      </Tooltip>
    </div>
  );
});

TerminalCopyAll.displayName = 'TerminalCopyAll';

export default TerminalCopyAll;
