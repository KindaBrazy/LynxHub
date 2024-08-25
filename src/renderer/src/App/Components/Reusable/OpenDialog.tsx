import {Button, ButtonGroup, Input} from '@nextui-org/react';
import {useCallback, useRef} from 'react';

import {getIconByName} from '../../../assets/icons/SvgIconsContainer';
import rendererIpc from '../../RendererIpc';

type Props = {
  dialogType: 'openDirectory' | 'openFile';
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
        const resultDir = extraFolder ? `${result}\\${extraFolder}` : result;
        setDirectory(resultDir);
        inputRef.current.value = resultDir;
      }
    });
  }, [dialogType, extraFolder, setDirectory]);

  return (
    <ButtonGroup fullWidth>
      <Input
        radius="sm"
        ref={inputRef}
        color="primary"
        value={directory}
        variant="bordered"
        defaultValue={directory}
        aria-label="Directory path"
        onValueChange={changeDirectory}
        classNames={{clearButton: 'cursor-default', inputWrapper: 'rounded-r-none'}}
        multiple
      />
      <Button
        radius="sm"
        variant="solid"
        onPress={chooseDirectory}
        className="cursor-default"
        aria-label="Choose directory"
        isIconOnly>
        {getIconByName('Folder', {className: 'size-[20px]'})}
      </Button>
    </ButtonGroup>
  );
}
