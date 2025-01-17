import {Button, Input, Select, SelectItem} from '@heroui/react';
import {Dispatch, SetStateAction, useCallback, useState} from 'react';

import {File_Icon, Folder2_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons1';
import {UserInputField, UserInputResult} from '../../../../Modules/types';
import rendererIpc from '../../../../RendererIpc';
import LynxSwitch from '../../../Reusable/LynxSwitch';

type Props = {elements: UserInputField[]; setResult: Dispatch<SetStateAction<UserInputResult[]>>};

export default function UserInputs({elements, setResult}: Props) {
  const [selectedFolder, setSelectedFolder] = useState<string>('Click here to select folder');
  const [selectedFile, setSelectedFile] = useState<string>('Click here to select file');

  const updateResult = useCallback(
    (id: string, value: string | boolean) => {
      setResult(prevResult => {
        const newResult = [...prevResult];

        const existingIndex = newResult.findIndex(item => item.id === id);
        if (existingIndex !== -1) {
          newResult[existingIndex] = {id, result: value};
        } else {
          newResult.push({id, result: value});
        }

        return newResult;
      });
    },
    [setResult],
  );

  const selectPath = useCallback(
    (type: 'folder' | 'file', id: string) => {
      switch (type) {
        case 'folder':
          rendererIpc.file.openDlg({properties: ['openDirectory']}).then(result => {
            setSelectedFolder(result || 'Click here to select folder');
            updateResult(id, result || '');
          });
          break;
        case 'file':
          rendererIpc.file.openDlg({properties: ['openFile']}).then(result => {
            setSelectedFile(result || 'Click here to select file');
            updateResult(id, result || '');
          });
          break;
      }
    },
    [setSelectedFolder],
  );

  const onSwitchChange = useCallback((value: boolean, id: string) => {
    updateResult(id, value);
  }, []);

  const onInputChange = useCallback((value: string, id: string) => {
    updateResult(id, value);
  }, []);

  const onSelectChange = useCallback((value: string, id: string) => {
    updateResult(id, value);
  }, []);

  return (
    <div className="mb-6 mt-4 flex flex-col items-center justify-center gap-y-6">
      <span className="text-large font-semibold">Please fill in the required information and click Next</span>
      {elements.map(element => {
        const {id, label, type, selectOptions} = element;
        switch (type) {
          case 'checkbox':
            return <LynxSwitch key={label} title={label} onEnabledChange={value => onSwitchChange(value, id)} />;
          case 'text-input':
            return (
              <Input
                key={label}
                label={label}
                labelPlacement="outside"
                onValueChange={value => onInputChange(value, id)}
                fullWidth
              />
            );
          case 'select':
            return (
              <Select
                onChange={e => {
                  onSelectChange(e.target.value, id);
                }}
                key={label}
                label={label}
                className="mt-4"
                labelPlacement="outside">
                {selectOptions!.map(option => {
                  return <SelectItem key={option}>{option}</SelectItem>;
                })}
              </Select>
            );
          case 'directory':
            return (
              <div key={`${label}_div`} className="flex w-full flex-col gap-y-2">
                <span key={`${label}_text`} className="text-small">
                  {label}
                </span>
                <Button
                  key={label}
                  variant="flat"
                  endContent={<div />}
                  className="justify-between"
                  startContent={<Folder2_Icon />}
                  onPress={() => selectPath('folder', id)}
                  fullWidth>
                  {selectedFolder}
                </Button>
              </div>
            );
          case 'file':
            return (
              <div key={`${label}_div`} className="flex w-full flex-col gap-y-2">
                <span key={`${label}_text`} className="text-small">
                  {label}
                </span>
                <Button
                  key={label}
                  variant="flat"
                  endContent={<div />}
                  className="justify-between"
                  startContent={<File_Icon />}
                  onPress={() => selectPath('file', id)}
                  fullWidth>
                  {selectedFile}
                </Button>
              </div>
            );
        }
      })}
    </div>
  );
}
