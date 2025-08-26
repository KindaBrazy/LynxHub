import {Button, Input, Select, SelectItem} from '@heroui/react';
import {isNil} from 'lodash';
import {Dispatch, FC, SetStateAction, useCallback, useEffect, useState} from 'react';

import {UserInputField, UserInputResult} from '../../../../../../../cross/plugin/ModuleTypes';
import {File_Icon, Folder2_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../../../RendererIpc';
import LynxSwitch from '../../../Reusable/LynxSwitch';

type Props = {
  inputElements: {elements: UserInputField[]; title?: string};
  setResult: Dispatch<SetStateAction<UserInputResult[]>>;
  extensionElements: FC[] | undefined;
};

export default function UserInputs({inputElements, setResult, extensionElements}: Props) {
  const [selectedFolder, setSelectedFolder] = useState<string>('Click here to select folder');
  const [selectedFile, setSelectedFile] = useState<string>('Click here to select file');
  const [errors, setErrors] = useState<Record<string, boolean>>({});

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

  const updateError = useCallback((id: string, hasError: boolean) => {
    setErrors(prev => ({
      ...prev,
      [id]: hasError,
    }));
  }, []);

  const selectPath = useCallback(
    (type: 'folder' | 'file', id: string, isRequired?: boolean) => {
      switch (type) {
        case 'folder':
          rendererIpc.file.openDlg({properties: ['openDirectory']}).then(result => {
            const folderPath = result || 'Click here to select folder';
            setSelectedFolder(folderPath);
            updateResult(id, result || '');

            // Update error state based on whether selection is valid and required
            if (isRequired) {
              updateError(id, !result || result.trim() === '');
            }
          });
          break;
        case 'file':
          rendererIpc.file.openDlg({properties: ['openFile']}).then(result => {
            const filePath = result || 'Click here to select file';
            setSelectedFile(filePath);
            updateResult(id, result || '');

            // Update error state based on whether selection is valid and required
            if (isRequired) {
              updateError(id, !result || result.trim() === '');
            }
          });
          break;
      }
    },
    [setSelectedFolder, setSelectedFile, updateResult, updateError],
  );

  const onSwitchChange = useCallback(
    (value: boolean, id: string) => {
      updateResult(id, value);
    },
    [updateResult],
  );

  const onInputChange = useCallback(
    (value: string, id: string) => {
      updateResult(id, value);
    },
    [updateResult],
  );

  const onSelectChange = useCallback(
    (value: string, id: string) => {
      updateResult(id, value);
    },
    [updateResult],
  );

  useEffect(() => {
    inputElements.elements.forEach(element => {
      const {id, type, defaultValue} = element;
      if (!isNil(defaultValue)) {
        switch (type) {
          case 'checkbox':
            if (typeof defaultValue === 'boolean') {
              updateResult(id, defaultValue);
            }
            break;
          case 'text-input':
          case 'select':
            if (typeof defaultValue === 'string') {
              updateResult(id, defaultValue);
            }
            break;
          default:
            break;
        }
      }
    });
  }, [inputElements.elements]);

  return (
    <div className="mb-6 mt-4 flex flex-col items-center justify-center gap-y-6">
      <span className="text-large font-semibold">
        {inputElements.title || 'Please fill in the required information and click Next'}
      </span>
      {inputElements.elements.map(element => {
        const {id, label, type, selectOptions, isRequired, defaultValue} = element;
        const hasError = errors[id] || false;

        switch (type) {
          case 'checkbox':
            return (
              <LynxSwitch
                key={label}
                title={label}
                enabled={!!defaultValue}
                onEnabledChange={value => onSwitchChange(value, id)}
              />
            );
          case 'text-input':
            return (
              <Input
                key={label}
                label={label}
                isRequired={isRequired}
                labelPlacement="outside"
                defaultValue={defaultValue as string | undefined}
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
                isRequired={isRequired}
                labelPlacement="outside"
                defaultSelectedKeys={defaultValue ? [defaultValue as string] : []}>
                {selectOptions!.map(option => {
                  return <SelectItem key={option}>{option}</SelectItem>;
                })}
              </Select>
            );
          case 'directory':
            return (
              <div key={`${label}_div`} className="flex w-full flex-col gap-y-2">
                <span
                  key={`${label}_text`}
                  className={`text-small ${isRequired ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}>
                  {label}
                </span>
                <Button
                  key={label}
                  variant="flat"
                  endContent={<div />}
                  startContent={<Folder2_Icon />}
                  onPress={() => selectPath('folder', id, isRequired)}
                  className={`justify-between ${hasError ? 'border-red-500 border-2' : ''}`}
                  fullWidth>
                  <span className={selectedFolder === 'Click here to select folder' && hasError ? 'text-red-500' : ''}>
                    {selectedFolder}
                  </span>
                </Button>
                {hasError && <span className="text-xs text-red-500">{label} is required. Please select a folder.</span>}
              </div>
            );
          case 'file':
            return (
              <div key={`${label}_div`} className="flex w-full flex-col gap-y-2">
                <span
                  key={`${label}_text`}
                  className={`text-small ${isRequired ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}>
                  {label}
                </span>
                <Button
                  key={label}
                  variant="flat"
                  endContent={<div />}
                  startContent={<File_Icon />}
                  onPress={() => selectPath('file', id, isRequired)}
                  className={`justify-between ${hasError ? 'border-red-500 border-2' : ''}`}
                  fullWidth>
                  <span className={selectedFile === 'Click here to select file' && hasError ? 'text-red-500' : ''}>
                    {selectedFile}
                  </span>
                </Button>
                {hasError && <span className="text-xs text-red-500">{label} is required. Please select a file.</span>}
              </div>
            );
        }
      })}

      {extensionElements?.map((Elem, index) => (
        <Elem key={`${index}_extension_userInputElement`} />
      ))}
    </div>
  );
}
