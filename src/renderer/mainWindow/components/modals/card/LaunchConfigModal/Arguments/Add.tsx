import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
  useDisclosure,
} from '@heroui/react';
import {Circle_Icon} from '@lynx_assets/icons';
import {ChosenArgumentsData, CustomArg} from '@lynx_common/types';
import {ChosenArgument} from '@lynx_common/types/plugins/modules';
import {Filter} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty, some} from 'lodash';
import {Plus} from 'lucide-react';
import {Dispatch, Key, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';

import {useTabVisibility} from '../../../../../layouts/tabs/utils';
import {useGetArgumentsByID} from '../../../../../plugins/modules';
import {getArgumentDefaultValue, getFilteredArguments} from '../../../../../utils/moduleArguments';
import LynxScroll from '../../../../LynxScroll';
import ArgumentSelectionList from './AddCategory';
import CustomArguments from './CustomArguments';

type Props = {
  addArgumentsModal: ReturnType<typeof useDisclosure>;
  chosenArguments: ChosenArgumentsData;
  setChosenArguments: Dispatch<SetStateAction<ChosenArgumentsData>>;
  id: string;
  tabId: string;
};

const isEmptyData = (data: any): boolean => {
  if (!data) return true;
  if ('sections' in data) {
    return data.sections.every((section: any) => section.items.length === 0);
  } else if ('items' in data) {
    return data.items.length === 0;
  }
  return true;
};

/**
 * Modal to select and add new arguments to the configuration.
 */
export default function AddArgumentModal({addArgumentsModal, chosenArguments, setChosenArguments, id, tabId}: Props) {
  const [filterArguments, setFilterArguments] = useState<Set<string>>(new Set(['all']));
  const [selectedArguments, setSelectedArguments] = useState<Set<string>>(new Set([]));
  const [searchValue, setSearchValue] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<Key>('module');

  const [customArgs, setCustomArgs] = useState<CustomArg[]>([]);

  const cardArgument = useGetArgumentsByID(id);

  useEffect(() => {
    setSelectedArguments(prevState => {
      const newSet = new Set(prevState);
      customArgs.forEach(item => newSet.add(item.name));
      return newSet;
    });
  }, [customArgs]);

  // Memoize the filtered list of available arguments
  const listData = useMemo(() => {
    const currentArgNames =
      chosenArguments.data.find(data => data.preset === chosenArguments.activePreset)?.arguments.map(arg => arg.name) ||
      [];

    return getFilteredArguments(cardArgument, currentArgNames);
  }, [chosenArguments.data, chosenArguments.activePreset, cardArgument]);

  const removeSelected = useCallback((value: string) => {
    setSelectedArguments(prevState => {
      const newSet = new Set(prevState);
      newSet.delete(value);
      return newSet;
    });
    setCustomArgs(prev => prev.filter(item => item.name !== value));
  }, []);

  const clearSelected = useCallback(() => {
    setSelectedArguments(new Set([]));
  }, []);

  const onClose = useCallback(() => {
    setSearchValue('');
    clearSelected();
    addArgumentsModal.onClose();
  }, [clearSelected, addArgumentsModal]);

  const onAdd = useCallback(() => {
    if (selectedArguments.size === 0) return;

    setChosenArguments(prevState => {
      const activePresetData = prevState.data.find(data => data.preset === prevState.activePreset);
      if (!activePresetData) return prevState;

      const currentArgs = activePresetData.arguments;

      const newArgsToAdd = Array.from(selectedArguments).filter(
        argName => !currentArgs.some(existingArg => existingArg.name === argName),
      );

      const newChosenArgs: ChosenArgument[] = newArgsToAdd.map(argName => ({
        name: argName,
        value: getArgumentDefaultValue(argName, cardArgument) || '',
      }));

      newChosenArgs.push(
        ...customArgs.map(item => ({
          name: item.name,
          value: item.defaultValue,
          custom: {kind: item.kind, type: item.type},
        })),
      );

      const newData = prevState.data.map(presetData => {
        if (presetData.preset === prevState.activePreset) {
          return {
            ...presetData,
            arguments: [...presetData.arguments, ...newChosenArgs],
          };
        }
        return presetData;
      });

      return {...prevState, data: newData};
    });

    onClose();
  }, [selectedArguments, cardArgument, onClose, setChosenArguments, customArgs]);

  const show = useTabVisibility(tabId);

  return (
    <Modal
      placement="center"
      isDismissable={false}
      scrollBehavior="inside"
      className="z-50 max-w-[75%]"
      isOpen={addArgumentsModal.isOpen}
      onOpenChange={addArgumentsModal.onOpenChange}
      classNames={{backdrop: `top-10! ${show}`, wrapper: `top-10! scrollbar-hide ${show}`}}
      hideCloseButton>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-y-2">
          <div className="flex w-full flex-row space-x-2 items-center">
            <span className="font-bold">Add Argument</span>
            {!isEmpty(selectedArguments) && (
              <Button size="sm" color="danger" variant="light" onPress={clearSelected}>
                Clear All
              </Button>
            )}
          </div>
          {!isEmpty(selectedArguments) && (
            <div className={'flex w-full flex-row flex-wrap gap-1 px-2 py-0.5 max-h-15 overflow-y-auto scrollbar-hide'}>
              {Array.from(selectedArguments).map((value: string) => (
                <Chip
                  size="sm"
                  key={value}
                  variant="flat"
                  color="success"
                  onClick={() => removeSelected(value)}
                  className="transition-colors duration-300 hover:bg-success/10 cursor-pointer">
                  {value}
                </Chip>
              ))}
            </div>
          )}
          <div className="flex w-full flex-row gap-x-2">
            <Input
              spellCheck="false"
              value={searchValue}
              onValueChange={setSearchValue}
              placeholder="Search by name or description..."
              startContent={<Circle_Icon className="size-4" />}
              autoFocus
              isClearable
            />
            <Dropdown>
              <DropdownTrigger>
                <Button variant="flat" isIconOnly>
                  <Filter />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                onSelectionChange={keys => {
                  setFilterArguments(keys as Set<string>);
                }}
                closeOnSelect={false}
                selectionMode="single"
                aria-label="Filter Arguments"
                selectedKeys={filterArguments}
                disallowEmptySelection>
                <DropdownSection title="Show">
                  <DropdownItem key="all" className="cursor-default">
                    All
                  </DropdownItem>
                  <DropdownItem key="selected" className="cursor-default">
                    Selected
                  </DropdownItem>
                  <DropdownItem key="notSelected" className="cursor-default">
                    Not Selected
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
          <Tabs className="my-2" onSelectionChange={setCurrentTab} selectedKey={currentTab.toString()} fullWidth>
            <Tab key="module" title="Module Provided" />
            <Tab key="custom" title="Custom" />
          </Tabs>
        </ModalHeader>
        <ModalBody as={LynxScroll} className="mr-2 pr-4">
          {currentTab === 'module' && (
            <div className="space-y-2">
              {listData?.map((data, index) => {
                if (isEmptyData(data)) return null;
                // Check if the category condition is met (if any)
                if (
                  data.condition &&
                  !selectedArguments.has(data.condition) &&
                  !some(chosenArguments.data.find(d => d.preset === chosenArguments.activePreset)?.arguments, {
                    name: data.condition,
                  })
                ) {
                  return null;
                }
                return (
                  <ArgumentSelectionList
                    title={data.category}
                    searchValue={searchValue}
                    key={`${index}_category`}
                    filterArguments={filterArguments}
                    selectedArguments={selectedArguments}
                    setSelectedArguments={setSelectedArguments}
                    listData={'sections' in data ? data.sections : data.items}
                  />
                );
              })}
            </div>
          )}
          {currentTab === 'custom' && (
            <CustomArguments id={id} setCustomArgs={setCustomArgs} selectedArguments={selectedArguments} />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="flat"
            color="success"
            onPress={onAdd}
            isDisabled={isEmpty(selectedArguments)}
            startContent={<Plus className="size-4" />}>
            Add
          </Button>
          <Button color="warning" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
