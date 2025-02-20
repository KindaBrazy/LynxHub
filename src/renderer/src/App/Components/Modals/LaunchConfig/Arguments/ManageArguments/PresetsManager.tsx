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
import {Button as AntBtn} from 'antd';
import {motion} from 'framer-motion';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';

import {ChosenArgumentsData} from '../../../../../../../../cross/CrossTypes';
import {Close_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons1';
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
      setInputErrorMessage('Please enter a preset name!');
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
    <motion.div
      transition={{duration: 0.15}}
      className="flex flex-row space-x-2"
      animate={{opacity: 1, translateY: 0}}
      initial={{opacity: 0, translateY: -50}}>
      {!isEmpty(sectionItems) && (
        <Select
          classNames={{
            innerWrapper: 'cursor-default',
            label: 'cursor-default',
            trigger: 'cursor-default border border-foreground/5 transition duration-300',
          }}
          title="Presets"
          items={sectionItems}
          selectionMode="single"
          aria-label="Select Preset"
          selectedKeys={selectedKey}
          onSelectionChange={changeActivePreset}
          disallowEmptySelection>
          {item => {
            return (
              <SelectItem
                endContent={
                  item.name !== 'Default' && (
                    <AntBtn
                      type="text"
                      size="small"
                      icon={<Close_Icon />}
                      className="cursor-default"
                      onClick={() => deletePreset(item.name)}
                      danger
                    />
                  )
                }
                key={item.name}
                className="cursor-default">
                {item.name}
              </SelectItem>
            );
          }}
        </Select>
      )}
      <Popover
        size="sm"
        placement="bottom"
        title="New Preset"
        isOpen={createIsOpen}
        onOpenChange={setCreateIsOpen}
        classNames={{content: 'border border-foreground/10'}}
        showArrow>
        <PopoverTrigger>
          <Button
            variant="flat"
            className="cursor-default border border-foreground/5 !duration-300 hover:text-opacity-70">
            New Preset
          </Button>
        </PopoverTrigger>
        <PopoverContent className="space-y-1.5 p-3">
          <Input
            size="sm"
            spellCheck="false"
            placeholder="Name..."
            isInvalid={!isInputValid}
            onValueChange={setInputValue}
            errorMessage={inputErrorMessage}
          />
          <ButtonGroup isDisabled={!isInputValid}>
            <Button size="sm" variant="flat" onPress={createNew} className="cursor-default">
              Create New
            </Button>
            <Button size="sm" variant="flat" className="cursor-default" onPress={duplicateExisting}>
              Duplicate Active
            </Button>
          </ButtonGroup>
        </PopoverContent>
      </Popover>
    </motion.div>
  );
}
