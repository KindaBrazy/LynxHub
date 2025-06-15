import {Button, ButtonGroup, Input} from '@heroui/react';
import {OpenDialogOptions} from 'electron';
import {useCallback, useEffect, useRef, useState} from 'react';

import {Folder_Icon} from '../../../assets/icons/SvgIcons/SvgIcons';
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
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    rendererIpc.file.isEmptyDir(directory).then(isEmpty => {
      if (!isEmpty) {
        setIsInvalid(true);
        setErrorMessage('Selected directory is not empty. Please choose an empty directory.');
      } else {
        rendererIpc.appData.isAppDir(directory).then(isAppDir => {
          setIsInvalid(isAppDir);
          setErrorMessage('Selecting the app folder can be dangerous and may lead to data loss.');
        });
      }
    });
  }, [directory]);

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
    <ButtonGroup className="items-start" fullWidth>
      <Input
        classNames={{
          inputWrapper: 'rounded-r-none !transition !duration-150',
        }}
        ref={inputRef}
        color="primary"
        value={directory}
        variant="bordered"
        isInvalid={isInvalid}
        defaultValue={directory}
        aria-label="Directory path"
        errorMessage={errorMessage}
        onValueChange={changeDirectory}
        multiple
      />

      <Button variant="solid" onPress={chooseDirectory} aria-label="Choose directory" isIconOnly>
        {<Folder_Icon className="size-[20px]" />}
      </Button>
    </ButtonGroup>
  );
}
