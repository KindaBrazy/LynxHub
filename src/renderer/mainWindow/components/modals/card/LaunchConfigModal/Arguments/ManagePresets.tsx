import {
  Button,
  ButtonGroup,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  Selection,
  SelectItem,
} from '@heroui/react';
import {ChosenArgumentsData} from '@lynx_common/types';
import {TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {motion} from 'framer-motion';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useCallback, useMemo, useState} from 'react';

import {convertArrToObject} from '../../../../../utils';

type Props = {
  presets: string[];
  setChosenArguments: Dispatch<SetStateAction<ChosenArgumentsData>>;
  chosenArguments: ChosenArgumentsData;
};

/**
 * PresetsManager component for managing and switching between multiple presets for arguments.
 * Allows creating new presets, duplicating existing ones, and deleting presets.
 */
export default function PresetsManager({chosenArguments, presets, setChosenArguments}: Props) {
  const [inputValue, setInputValue] = useState<string>('');
  const [createIsOpen, setCreateIsOpen] = useState<boolean>(false);

  // Derive error message directly from input value and existing presets
  const inputErrorMessage = useMemo(() => {
    if (!createIsOpen) return '';
    if (isEmpty(inputValue)) return 'Please enter preset name!';
    if (chosenArguments.data.some(data => data.preset === inputValue)) {
      return 'The chosen name already exists!';
    }
    return '';
  }, [inputValue, chosenArguments.data, createIsOpen]);

  const isInputValid = isEmpty(inputErrorMessage) && !isEmpty(inputValue);

  // Sync selected key with active preset
  const selectedKey = useMemo(() => new Set([chosenArguments.activePreset]), [chosenArguments.activePreset]);

  const deletePreset = useCallback(
    (name: string) => {
      setChosenArguments(prevState => {
        const newData = prevState.data.filter(data => data.preset !== name);
        // If we deleted the active preset, switch to the previous one or the first one
        if (prevState.activePreset === name) {
          const dataIndex = prevState.data.findIndex(data => data.preset === name);
          const newActivePreset = newData[dataIndex === 0 ? 0 : dataIndex - 1]?.preset || '';
          return {activePreset: newActivePreset, data: newData};
        }
        return {...prevState, data: newData};
      });
    },
    [setChosenArguments],
  );

  const changeActivePreset = useCallback(
    (keys: Selection) => {
      if (keys !== 'all') {
        const activePreset = keys.values().next().value?.toString();
        if (activePreset) {
          setChosenArguments(prevState => ({...prevState, activePreset}));
        }
      }
    },
    [setChosenArguments],
  );

  const handleCreateNew = useCallback(() => {
    if (!isInputValid) return;

    setChosenArguments(prevState => ({
      activePreset: inputValue,
      data: [...prevState.data, {arguments: [], preset: inputValue}],
    }));
    setCreateIsOpen(false);
    setInputValue('');
  }, [inputValue, isInputValid, setChosenArguments]);

  const handleDuplicateExisting = useCallback(() => {
    if (!isInputValid) return;

    setChosenArguments(prevState => {
      const existingArgs = prevState.data.find(data => data.preset === prevState.activePreset)?.arguments || [];
      return {
        activePreset: inputValue,
        data: [...prevState.data, {arguments: existingArgs, preset: inputValue}],
      };
    });
    setCreateIsOpen(false);
    setInputValue('');
  }, [inputValue, isInputValid, setChosenArguments]);

  const sectionItems = useMemo(() => convertArrToObject(presets), [presets]);

  return (
    <motion.div animate={{opacity: 1}} initial={{opacity: 0}} className="flex flex-row space-x-2 items-end">
      {!isEmpty(sectionItems) && (
        <Select
          classNames={{
            trigger: 'min-w-[150px]',
          }}
          label="Preset:"
          items={sectionItems}
          selectionMode="single"
          aria-label="Select Preset"
          selectedKeys={selectedKey}
          labelPlacement="outside-left"
          onSelectionChange={changeActivePreset}
          disallowEmptySelection>
          {item => (
            <SelectItem
              endContent={
                item.name !== 'Default' && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      deletePreset(item.name);
                    }}
                    className={
                      'rounded-sm transition-all duration-300 hover:bg-danger/30 size-[1.4rem] flex' +
                      ' items-center justify-center cursor-pointer text-danger'
                    }
                    aria-label={`Delete ${item.name} preset`}>
                    <TrashBin2 size={16} />
                  </button>
                )
              }
              key={item.name}>
              {item.name}
            </SelectItem>
          )}
        </Select>
      )}
      <Popover
        onOpenChange={isOpen => {
          setCreateIsOpen(isOpen);
          if (!isOpen) setInputValue('');
        }}
        size="sm"
        placement="bottom"
        isOpen={createIsOpen}
        classNames={{content: 'border border-foreground/5'}}
        showArrow>
        <PopoverTrigger>
          <Button variant="flat">New</Button>
        </PopoverTrigger>
        <PopoverContent className="gap-y-2 p-4 items-start w-[250px]">
          <h4 className="font-bold text-small">New Preset</h4>
          <Input
            onKeyUp={e => {
              if (e.key === 'Enter') handleCreateNew();
            }}
            size="sm"
            spellCheck="false"
            value={inputValue}
            label="Preset Name"
            onValueChange={setInputValue}
            errorMessage={inputErrorMessage}
            isInvalid={!!inputErrorMessage && !isEmpty(inputValue)}
            autoFocus
          />
          <ButtonGroup size="sm" variant="flat" className="w-full" isDisabled={!isInputValid}>
            <Button className="flex-1" onPress={handleCreateNew}>
              Create
            </Button>
            <Button className="flex-1" onPress={handleDuplicateExisting}>
              Duplicate
            </Button>
          </ButtonGroup>
        </PopoverContent>
      </Popover>
    </motion.div>
  );
}
