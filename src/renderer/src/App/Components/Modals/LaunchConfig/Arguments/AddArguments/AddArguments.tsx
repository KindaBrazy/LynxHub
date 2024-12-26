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
  useDisclosure,
} from '@nextui-org/react';
import {isEmpty, some} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useCallback, useMemo, useState} from 'react';

import {ArgumentsPresets, ChosenArgument, ChosenArgumentsData} from '../../../../../../../../cross/CrossTypes';
import {getArgumentDefaultValue, getFilteredArguments} from '../../../../../../../../cross/GetArgumentsData';
import {Circle_Icon, Filter_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons1';
import {getArgumentsByID} from '../../../../../Modules/ModuleLoader';
import {useModalsState} from '../../../../../Redux/AI/ModalsReducer';
import {useAppState} from '../../../../../Redux/App/AppReducer';
import ArgumentCategory from './ArgumentCategory';

type Props = {
  addArgumentsModal: ReturnType<typeof useDisclosure>;
  chosenArguments: ArgumentsPresets;
  setChosenArguments: Dispatch<SetStateAction<ChosenArgumentsData>>;
};

const isEmptyData = (data): boolean => {
  if ('sections' in data) {
    // Data has the 'sections' property
    return data.sections.every(section => section.items.length === 0);
  } else if ('items' in data) {
    // Data has the 'items' property
    return data.items.length === 0;
  }

  // Invalid input data
  return false;
};

/** Select and add arguments */
export default function AddArguments({addArgumentsModal, chosenArguments, setChosenArguments}: Props) {
  const {id} = useModalsState('cardLaunchConfig');
  const isDarkMode = useAppState('darkMode');
  const [filterArguments, setFilterArguments] = useState<Set<string>>(new Set(['all']));
  const [selectedArguments, setSelectedArguments] = useState<Set<string>>(new Set([]));
  const [searchValue, setSearchValue] = useState<string>('');

  const listData = useMemo(
    () =>
      getFilteredArguments(
        getArgumentsByID(id),
        chosenArguments.arguments.map(argument => argument.name),
      ),
    [chosenArguments],
  );

  const removeSelected = useCallback((value: string) => {
    setSelectedArguments(prevState => {
      const newSet = new Set(prevState);
      newSet.delete(value);
      return newSet;
    });
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
    setChosenArguments(prevState => {
      const selectedArg = Array.from(selectedArguments).filter(
        arg =>
          !prevState.data
            .find(data => data.preset === prevState.activePreset)
            ?.arguments.some(data => data.name === arg),
      );

      const result: ChosenArgument[] = selectedArg.map(arg => {
        return {name: arg, value: getArgumentDefaultValue(arg, getArgumentsByID(id)) || ''};
      });

      // return {...prevState, arguments: [...prevState.arguments, result]};
      const data = [...prevState.data].map(arg => {
        const argResult = arg;
        if (arg.preset === prevState.activePreset) {
          argResult.arguments = [...argResult.arguments, ...result];
        }
        return argResult;
      });
      return {...prevState, data};
    });
    onClose();
  }, [selectedArguments, id, onClose]);

  return (
    <Modal
      radius="md"
      isDismissable={false}
      scrollBehavior="inside"
      className="z-50 max-w-[75%]"
      isOpen={addArgumentsModal.isOpen}
      onOpenChange={addArgumentsModal.onOpenChange}
      classNames={{backdrop: '!top-10', wrapper: '!top-10 scrollbar-hide'}}
      hideCloseButton>
      <ModalContent>
        <ModalHeader className="flex flex-col space-y-2">
          <div className="flex w-full flex-row space-x-2">
            <span className="font-bold">Add Argument</span>
            {!isEmpty(selectedArguments) && (
              <Button
                size="sm"
                color="danger"
                variant="light"
                onPress={clearSelected}
                className="animate-appearance-in cursor-default">
                Clear All
              </Button>
            )}
          </div>
          {!isEmpty(selectedArguments) && (
            <div className="flex w-full flex-row flex-wrap gap-1 px-2 py-0.5">
              {Array.from(selectedArguments).map((value: string) => (
                <Chip
                  size="sm"
                  radius="sm"
                  key={value}
                  variant="faded"
                  color="success"
                  onClick={() => removeSelected(value)}
                  classNames={{closeButton: 'cursor-default'}}
                  className="animate-appearance-in transition-colors duration-300 hover:border-default-500">
                  {value}
                </Chip>
              ))}
            </div>
          )}
          <div className="flex w-full flex-row space-x-2">
            <Input
              radius="md"
              spellCheck={false}
              onValueChange={setSearchValue}
              placeholder="Search by name or description..."
              startContent={<Circle_Icon className="size-3.5" />}
              autoFocus
              isClearable
            />
            <Dropdown>
              <DropdownTrigger>
                <Button radius="md" variant="flat" className="cursor-default" isIconOnly>
                  <Filter_Icon />
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
        </ModalHeader>
        <ModalBody
          options={{
            overflow: {x: 'hidden', y: 'scroll'},
            scrollbars: {
              autoHide: 'leave',
              clickScroll: true,
              theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
            },
          }}
          className="mr-2 pr-4"
          as={OverlayScrollbarsComponent}>
          <div className="space-y-2">
            {listData?.map((data, index) => {
              if (isEmptyData(data)) return null;
              if (
                data.condition &&
                !selectedArguments.has(data.condition) &&
                !some(chosenArguments.arguments, {name: data.condition})
              ) {
                return null;
              }
              return (
                <ArgumentCategory
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
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            color="success"
            onPress={onAdd}
            className="cursor-default"
            isDisabled={isEmpty(selectedArguments)}>
            Add
          </Button>
          <Button color="danger" variant="light" onPress={onClose} className="cursor-default">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
