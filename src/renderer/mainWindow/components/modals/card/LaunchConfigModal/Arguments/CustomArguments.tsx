import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  NumberInput,
  Select,
  SelectItem,
  SharedSelection,
} from '@heroui/react';
import {ArgumentType} from '@lynx_common/types/plugins/modules';
import filesIpc from '@lynx_shared/ipc/files';
import {
  CloseCircle,
  HomeAddAngle,
  Inbox,
  Pen2,
  SettingsMinimalistic,
  TrashBin2,
} from '@solar-icons/react-perf/BoldDuotone';
import {CheckRead, Unread} from '@solar-icons/react-perf/Linear';
import {AnimatePresence, motion} from 'framer-motion';
import {some} from 'lodash';
import {Plus} from 'lucide-react';
import {Dispatch, ReactNode, SetStateAction, useState} from 'react';

import EmptyStateCard from '../../../../EmptyStateCard';

type ItemKinds = 'envVar' | 'commandLine' | 'comment';
type CustomItem = {name: string; kind: ItemKinds; type: ArgumentType; defaultValue?: any};

type AnimProp = {
  children: ReactNode;
  show: boolean;
};

// Helper function to check if a name is already in the list
function isNameUnique(items: CustomItem[], newName: string): boolean {
  return !some(items, {name: newName});
}

// Helper function to generate a unique name
function generateUniqueName(items: CustomItem[], baseName: string): string {
  let counter = 1;
  let newName = baseName;

  while (!isNameUnique(items, newName)) {
    newName = `${baseName}_${counter++}`;
  }

  return newName;
}

function AnimateChild({show, children}: AnimProp) {
  return (
    <AnimatePresence mode="popLayout">
      {show && (
        <motion.div
          exit={{translateY: 5, opacity: 0, scale: 0.7}}
          animate={{translateY: 0, opacity: 1, scale: 1}}
          initial={{translateY: 5, opacity: 0, scale: 0.7}}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RenderItem(
  item: CustomItem,
  isAdded: boolean,
  setCustomList: Dispatch<SetStateAction<CustomItem[]>>,
  addItem: (item: CustomItem) => void,
  removeItem: (item: CustomItem) => void,
) {
  const onNameChange = (value: string) => {
    setCustomList(prevState =>
      prevState.map(listItem => {
        return listItem.name !== item.name ? listItem : {...listItem, name: value};
      }),
    );
  };

  const onDefaultValueChange = (value: any) => {
    setCustomList(prevState =>
      prevState.map(listItem => {
        return listItem.name !== item.name ? listItem : {...listItem, defaultValue: value};
      }),
    );
  };

  const onTypeChange = (keys: SharedSelection) => {
    const targetKey = Array.from(keys)[0] as ArgumentType;
    setCustomList(prevState =>
      prevState.map(listItem => (listItem.name === item.name ? {...listItem, type: targetKey} : listItem)),
    );
  };

  const selectFolder = () => {
    filesIpc.openDlg({properties: ['openDirectory']}).then(selectedPath => {
      if (selectedPath) onDefaultValueChange(selectedPath);
    });
  };

  const selectFile = () => {
    filesIpc.openDlg({properties: ['openFile']}).then(selectedPath => {
      if (selectedPath) onDefaultValueChange(selectedPath);
    });
  };

  const clearDefaultValue = () => onDefaultValueChange(undefined);

  switch (item.kind) {
    case 'envVar':
    case 'commandLine':
      return (
        <AnimatePresence>
          <motion.div
            animate={{translateY: 0, opacity: 1, scale: 1}}
            initial={{translateY: 5, opacity: 0, scale: 0.9}}
            className="text-sm bg-background dark:bg-LynxNearBlack flex flex-col px-4 py-3 rounded-xl gap-y-2"
            layout>
            <div className="flex justify-between items-center">
              <div
                className={
                  `flex items-center gap-x-2 font-semibold ` +
                  `${item.kind === 'envVar' ? 'text-primary-500' : 'text-secondary-500'}`
                }>
                {item.kind === 'envVar' ? <HomeAddAngle /> : <SettingsMinimalistic />}
                <span>{item.kind === 'envVar' ? 'Environment Variable' : 'Command Line'}</span>
              </div>
              <div className="flex items-center gap-x-1">
                <AnimateChild show={isAdded}>
                  <Button size="sm" color="success" variant="light" isIconOnly>
                    <CheckRead className="size-4.5" />
                  </Button>
                </AnimateChild>
                <AnimateChild show={!isAdded}>
                  <Button size="sm" variant="light" onPress={() => addItem(item)} isIconOnly>
                    <Unread className="size-4.5" />
                  </Button>
                </AnimateChild>

                <Button size="sm" color="danger" variant="light" onPress={() => removeItem(item)} isIconOnly>
                  <TrashBin2 className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-x-4">
              <div className="flex items-center gap-x-2">
                <span className="shrink-0">Name:</span>
                <Input size="sm" value={item.name} onValueChange={onNameChange} />
              </div>

              <Divider className="h-4" orientation="vertical" />

              <div className="flex items-center gap-x-2 flex-1">
                <span className="shrink-0">Type:</span>
                <Select
                  size="sm"
                  selectedKeys={[item.type]}
                  onSelectionChange={onTypeChange}
                  aria-label="Select the argument type">
                  <SelectItem key="Input" variant="flat">
                    Input (Text)
                  </SelectItem>
                  <SelectItem key="Number" variant="flat">
                    Number
                  </SelectItem>
                  <SelectItem variant="flat" key="Directory">
                    Folder
                  </SelectItem>
                  <SelectItem key="File" variant="flat">
                    File
                  </SelectItem>
                  <SelectItem variant="flat" key="CheckBox">
                    Boolean
                  </SelectItem>
                  <SelectItem variant="flat" key="DropDown">
                    Select (Predefined Values)
                  </SelectItem>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-x-2">
              {item.type === 'Input' && (
                <>
                  <span className="shrink-0">Default Value:</span>
                  <Input
                    size="sm"
                    spellCheck="false"
                    onValueChange={onDefaultValueChange}
                    placeholder="Enter defualt value..."
                    value={typeof item.defaultValue !== 'string' ? '' : item.defaultValue}
                    fullWidth
                    isClearable
                  />
                </>
              )}
              {item.type === 'Number' && (
                <>
                  <span className="shrink-0">Default Value:</span>
                  <NumberInput
                    size="sm"
                    spellCheck="false"
                    onValueChange={onDefaultValueChange}
                    placeholder="Enter defualt value..."
                    value={typeof item.defaultValue === 'string' ? 0 : item.defaultValue}
                    fullWidth
                    isClearable
                  />
                </>
              )}
              {item.type === 'Directory' && (
                <>
                  <span className="shrink-0">Folder:</span>
                  <Button
                    endContent={
                      item.defaultValue && (
                        <Button size="sm" variant="light" className="size-6" onPress={clearDefaultValue} isIconOnly>
                          <CloseCircle className="size-4" />
                        </Button>
                      )
                    }
                    size="sm"
                    variant="flat"
                    onPress={selectFolder}
                    className={`justify-between ${item.defaultValue && 'text-foreground'}`}
                    fullWidth>
                    {item.defaultValue || 'Press to set default folder...'}
                  </Button>
                </>
              )}
              {item.type === 'File' && (
                <>
                  <span className="shrink-0">Folder:</span>
                  <Button
                    endContent={
                      item.defaultValue && (
                        <Button size="sm" variant="light" className="size-6" onPress={clearDefaultValue} isIconOnly>
                          <CloseCircle className="size-4" />
                        </Button>
                      )
                    }
                    size="sm"
                    variant="flat"
                    onPress={selectFile}
                    className={`justify-between ${item.defaultValue && 'text-foreground'}`}
                    fullWidth>
                    {item.defaultValue || 'Press to set default file...'}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      );
    case 'comment':
      return (
        <AnimatePresence>
          <motion.div
            animate={{translateY: 0, opacity: 1, scale: 1}}
            initial={{translateY: 5, opacity: 0, scale: 0.9}}
            className="text-sm bg-background dark:bg-LynxNearBlack flex flex-col px-4 py-3 rounded-xl gap-y-2"
            layout>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-x-2 text-warning-400 font-semibold">
                <Pen2 />
                <span>Comment</span>
              </div>
              <div className="flex items-center gap-x-1">
                <AnimateChild show={isAdded}>
                  <Button size="sm" color="success" variant="light" isIconOnly>
                    <CheckRead className="size-4.5" />
                  </Button>
                </AnimateChild>
                <AnimateChild show={!isAdded}>
                  <Button size="sm" variant="light" onPress={() => addItem(item)} isIconOnly>
                    <Unread className="size-4.5" />
                  </Button>
                </AnimateChild>

                <Button size="sm" color="danger" variant="light" onPress={() => removeItem(item)} isIconOnly>
                  <TrashBin2 className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-x-4">
              <div className="flex items-center gap-x-2 flex-1">
                <span className="shrink-0">Comment Text:</span>
                <Input
                  size="sm"
                  spellCheck="false"
                  value={item.defaultValue}
                  onValueChange={onDefaultValueChange}
                  placeholder="Enter defualt value..."
                  fullWidth
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      );
  }
}

export default function CustomArguments() {
  const [customList, setCustomList] = useState<CustomItem[]>([]);
  const [addedList, setAddedList] = useState<CustomItem[]>([]);

  const addCustom = (itemKind: ItemKinds) => {
    setCustomList(prevState => {
      let baseName: string;

      switch (itemKind) {
        case 'envVar':
          baseName = 'environment';
          break;
        case 'commandLine':
          baseName = 'command';
          break;
        case 'comment':
          baseName = 'comment';
          break;
        default:
          baseName = 'unknown';
          break;
      }

      const uniqueName = generateUniqueName(prevState, baseName);
      const itemToAdd: CustomItem = {
        name: uniqueName,
        type: 'Input',
        kind: itemKind,
      };

      return [...prevState, itemToAdd];
    });
  };

  const isAdded = (item: CustomItem) => {
    return addedList.some(listItem => listItem.name === item.name);
  };

  const addItem = (item: CustomItem) => {
    if (!isAdded(item)) setAddedList(prevState => [...prevState, item]);
  };

  const removeItem = (item: CustomItem) => {
    setAddedList(prevState => prevState.filter(listItem => listItem.name !== item.name));
    setCustomList(prevState => prevState.filter(listItem => listItem.name !== item.name));
  };

  return (
    <div className="bg-foreground-100 rounded-xl flex flex-col inset-0 items-center p-4 relative">
      <div className="size-full flex justify-between mb-4">
        <div />
        <span className="font-bold text-LynxOrange">Custom Arguments List</span>
        <Dropdown showArrow>
          <DropdownTrigger>
            <Button size="sm" variant="light" isIconOnly>
              <Plus className="size-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem key="envVar" startContent={<HomeAddAngle />} onPress={() => addCustom('envVar')}>
              Environment Variable
            </DropdownItem>
            <DropdownItem
              key="commandLine"
              startContent={<SettingsMinimalistic />}
              onPress={() => addCustom('commandLine')}>
              Command Line
            </DropdownItem>
            <DropdownItem key="comment" startContent={<Pen2 />} onPress={() => addCustom('comment')}>
              Comment
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className="w-full flex flex-col gap-y-2">
        <AnimatePresence mode="popLayout">
          {customList.length === 0 ? (
            <motion.div
              animate={{translateY: 0, opacity: 1, scale: 1}}
              initial={{translateY: 5, opacity: 0, scale: 0.9}}>
              <EmptyStateCard
                description={
                  <span className="flex items-center gap-x-1 text-sm text-foreground-500">
                    Use <Plus className="size-3 text-foreground" /> Button to add new item.
                  </span>
                }
                icon={<Inbox size={40} />}
                className="bg-foreground-50"
                title="No custom argument available to display"
              />
            </motion.div>
          ) : (
            customList.map(item => RenderItem(item, isAdded(item), setCustomList, addItem, removeItem))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
