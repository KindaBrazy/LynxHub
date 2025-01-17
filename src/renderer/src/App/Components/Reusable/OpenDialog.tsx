import {Button, ButtonGroup, Input} from '@heroui/react';
import {OpenDialogOptions} from 'electron';
import {useCallback, useRef} from 'react';

import {Folder_Icon} from '../../../assets/icons/SvgIcons/SvgIcons1';
import rendererIpc from '../../RendererIpc';

type Props = {
  dialogType: OpenDialogOptions;
  directory: string;
  setDirectory: (directory: string) => void;
  extraFolder?: string;
};

/** Input field with a button to open a file/directory dialog. */
export default function OpenDialog({dialogType, directory, extraFolder = '', setDirectory}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const changeDirectory = useCallback(
    (value: string) => {
      if (value && inputRef.current) {
        setDirectory(value);
        inputRef.current.value = value;
      }
    },
    [setDirectory],
  );

  const chooseDirectory = useCallback(() => {
    rendererIpc.file.openDlg(dialogType).then(result => {
      if (result && inputRef.current) {
        const isWin = window.osPlatform === 'win32';
        const resultDir = extraFolder ? `${result}${isWin ? '\\' : '/'}${extraFolder}` : result;
        setDirectory(resultDir);
        inputRef.current.value = resultDir;
      }
    });
  }, [dialogType, extraFolder, setDirectory]);

  return (
    <ButtonGroup fullWidth>
      <Input
        classNames={{
          inputWrapper: 'rounded-r-none !transition !duration-150',
        }}
        ref={inputRef}
        color="primary"
        value={directory}
        variant="bordered"
        defaultValue={directory}
        aria-label="Directory path"
        onValueChange={changeDirectory}
        multiple
      />
      <Button variant="solid" onPress={chooseDirectory} aria-label="Choose directory" isIconOnly>
        {<Folder_Icon className="size-[20px]" />}
      </Button>
    </ButtonGroup>
  );
}
