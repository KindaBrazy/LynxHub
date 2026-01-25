import {Button, Tooltip} from '@heroui/react';
import {lynxTopToast} from '@lynx/hooks/utils';
import {AppDispatch} from '@lynx/redux/store';
import filesIpc from '@lynx_shared/ipc/files';
import {FileText} from '@solar-icons/react-perf/BoldDuotone';
import {SerializeAddon} from '@xterm/addon-serialize';
import {memo, useCallback} from 'react';
import {useDispatch} from 'react-redux';

import CopyClipboard from '../../../../components/CopyClipboard';

type Props = {
  serializeAddon: SerializeAddon;
};

const CopyAll = memo(({serializeAddon}: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleCopy = useCallback(() => {
    const contentToCopy = serializeAddon.serialize();
    if (!contentToCopy) return;

    navigator.clipboard.writeText(contentToCopy);
  }, []);

  const saveFile = useCallback(() => {
    const contentToSave = serializeAddon.serialize();
    if (!contentToSave) {
      lynxTopToast(dispatch).warning('Failed get terminal text to save!');
    }

    filesIpc
      .saveToFile(contentToSave)
      .then(result => {
        if (result) {
          lynxTopToast(dispatch).success('Saved terminal text to file!');
        } else {
          lynxTopToast(dispatch).error('Failed to save terminal text to file!');
        }
      })
      .catch(() => lynxTopToast(dispatch).error('Failed to save terminal text to file!'));
  }, []);

  return (
    <div className="flex flex-row items-center gap-x-1">
      <CopyClipboard onCopy={handleCopy} tooltipTitle="Copy all to clipboard" />

      <Tooltip delay={500} content="Export all to file">
        <Button size="sm" variant="light" onPress={saveFile} isIconOnly>
          <FileText className="size-3.5" />
        </Button>
      </Tooltip>
    </div>
  );
});
export default CopyAll;
