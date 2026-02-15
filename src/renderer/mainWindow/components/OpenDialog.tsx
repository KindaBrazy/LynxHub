import {Button, ButtonGroup, Input} from '@heroui/react';
import {isWin} from '@lynx_common/utils';
import applicationIpc from '@lynx_shared/ipc/application';
import filesIpc from '@lynx_shared/ipc/files';
import {MoveToFolder} from '@solar-icons/react-perf/BoldDuotone';
import {OpenDialogOptions} from 'electron';
import {useCallback, useEffect, useRef, useState} from 'react';
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
    filesIpc.isEmptyDir(directory).then(isEmpty => {
      if (!isEmpty) {
        setIsInvalid(true);
        setErrorMessage('Selected directory is not empty. Please choose an empty directory.');
      } else {
        applicationIpc.invoke.isValidDataPath(directory).then(isAppDir => {
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
    filesIpc.openDlg(dialogType).then(result => {
      if (result && inputRef.current) {
        const resultDir = extraFolder ? `${result}${isWin() ? '\\' : '/'}${extraFolder}` : result;
        setDirectory(resultDir);
        inputRef.current.value = resultDir;
      }
    });
  }, [dialogType, extraFolder, setDirectory]);

  return (
    <ButtonGroup className="items-start" fullWidth>
      <Input
        classNames={{
          inputWrapper: 'rounded-r-none transition! duration-150!',
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
        {<MoveToFolder className="size-4.5" />}
      </Button>
    </ButtonGroup>
  );
}
