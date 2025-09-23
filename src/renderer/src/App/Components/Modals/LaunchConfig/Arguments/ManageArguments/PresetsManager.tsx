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
import {motion} from 'framer-motion';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';

import {ChosenArgumentsData} from '../../../../../../../../cross/CrossTypes';
import {TrashDuo_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {convertArrToObject} from '../../../../../Utils/UtilFunctions';

type Props = {
  presets: string[];
  setChosenArguments: Dispatch<SetStateAction<ChosenArgumentsData>>;
  chosenArguments: ChosenArgumentsData;
};

type Preset = {
  name: string;
};

/** PresetsManager component for managing and switching between multiple presets for arguments */
export default function PresetsManager({chosenArguments, presets, setChosenArguments}: Props) {
  const [inputValue, setInputValue] = useState<string>('');
  const [inputErrorMessage, setInputErrorMessage] = useState<string>('');
  const [createIsOpen, setCreateIsOpen] = useState<boolean>(false);
  const [selectedKey, setSelectedKey] = useState<Selection>(new Set([]));

  useEffect(() => {
    setInputValue('');
  }, [createIsOpen]);

  useEffect(() => {
    if (chosenArguments.data.some(data => data.preset === inputValue)) {
      setInputErrorMessage('The chosen name already exists!');
    } else if (isEmpty(inputValue)) {
      setInputErrorMessage('Please enter preset name!');
    } else {
      setInputErrorMessage('');
    }
  }, [inputValue]);

  useEffect(() => {
    if (selectedKey !== 'all' && !selectedKey.has(chosenArguments.activePreset)) {
      setSelectedKey(new Set([chosenArguments.activePreset]));
    }
  }, [chosenArguments, selectedKey]);

  const deletePreset = useCallback(
    (name: string) => {
      setChosenArguments(prevState => {
        const newData = prevState.data.filter(data => data.preset !== name);
        if (prevState.activePreset === name) {
          const dataIndex = prevState.data.findIndex(data => data.preset === name);
          const activePreset = newData[dataIndex === 0 ? 0 : dataIndex - 1]?.preset || '';
          return {activePreset, data: newData};
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
        setChosenArguments(prevState => (activePreset ? {...prevState, activePreset} : {...prevState}));
      }
    },
    [setChosenArguments],
  );

  const createNew = useCallback(() => {
    setChosenArguments(prevState => {
      return {activePreset: inputValue, data: [...prevState.data, {arguments: [], preset: inputValue}]};
    });
    setCreateIsOpen(false);
  }, [inputValue]);

  const duplicateExisting = useCallback(() => {
    if (selectedKey !== 'all') {
      setChosenArguments((prevState: ChosenArgumentsData): ChosenArgumentsData => {
        const selectedValue = selectedKey.values().next().value;
        const existing = prevState.data.find(data => data.preset === selectedValue)?.arguments || [];
        return {
          activePreset: inputValue,
          data: [...prevState.data, {arguments: existing, preset: inputValue}],
        };
      });
      setCreateIsOpen(false);
    }
  }, [selectedKey, inputValue]);

  const sectionItems: Preset[] = useMemo(() => convertArrToObject(presets), [presets]);

  const isInputValid = isEmpty(inputErrorMessage);

  return (
    <motion.div animate={{opacity: 1}} initial={{opacity: 0}} className="flex flex-row space-x-2 items-end">
      {!isEmpty(sectionItems) && (
        <Select
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
                    className={
                      'rounded-sm transition-all duration-300 hover:bg-danger/30 size-[1.4rem] flex ' +
                      'items-center justify-center cursor-pointer'
                    }
                    onClick={() => deletePreset(item.name)}>
                    <TrashDuo_Icon className="text-danger" />
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
        size="sm"
        placement="bottom"
        title="New Preset"
        isOpen={createIsOpen}
        onOpenChange={setCreateIsOpen}
        classNames={{content: 'border border-foreground/5'}}
        showArrow>
        <PopoverTrigger>
          <Button variant="flat">New</Button>
        </PopoverTrigger>
        <PopoverContent className="gap-y-2 p-4 items-start">
          <Input
            onKeyUp={e => {
              if (e.key === 'Enter') createNew();
            }}
            size="sm"
            spellCheck="false"
            label="Preset Name"
            isInvalid={!isInputValid}
            onValueChange={setInputValue}
            errorMessage={inputErrorMessage}
          />
          <ButtonGroup size="sm" variant="flat" isDisabled={!isInputValid}>
            <Button onPress={createNew}>Create</Button>
            <Button onPress={duplicateExisting}>Duplicate Active</Button>
          </ButtonGroup>
        </PopoverContent>
      </Popover>
    </motion.div>
  );
}
