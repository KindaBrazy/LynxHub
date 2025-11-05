import {Button, Tooltip} from '@heroui/react';
import {SerializeAddon} from '@xterm/addon-serialize';
import {memo, useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {CheckDuo_Icon, CopyDuo_Icon, FileDownDuo_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import {lynxTopToast} from '../../../../Utils/UtilHooks';

type Props = {
  serializeAddon: SerializeAddon;
};

const CopyAll = memo(({serializeAddon}: Props) => {
  const [copied, setCopied] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const handleCopy = useCallback(() => {
    const contentToCopy = serializeAddon.serialize();
    if (!contentToCopy) return;

    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }, []);

  const saveFile = useCallback(() => {
    const contentToSave = serializeAddon.serialize();
    if (!contentToSave) {
      lynxTopToast(dispatch).warning('Failed get terminal text to save!');
    }

    rendererIpc.file
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
      <Tooltip delay={500} content="Copy all to clipboard">
        <Button size="sm" variant="light" onPress={handleCopy} isIconOnly>
          {copied ? (
            <CheckDuo_Icon className="size-5 animate-appearance-in" />
          ) : (
            <CopyDuo_Icon className="size-3.5 animate-appearance-in" />
          )}
        </Button>
      </Tooltip>

      <Tooltip delay={500} content="Export all to file">
        <Button size="sm" variant="light" onPress={saveFile} isIconOnly>
          <FileDownDuo_Icon className="size-3.5" />
        </Button>
      </Tooltip>
    </div>
  );
});
export default CopyAll;
