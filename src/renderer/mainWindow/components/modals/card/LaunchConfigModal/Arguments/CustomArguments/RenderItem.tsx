import {Button, Chip, Divider, Input, NumberInput, Select, SelectItem, SharedSelection, Textarea} from '@heroui/react';
import {CustomArg} from '@lynx_common/types';
import {ArgumentType} from '@lynx_common/types/plugins/modules';
import filesIpc from '@lynx_shared/ipc/files';
import {CloseCircle, HomeAdd, Notes, Pen2, SettingsMinimalistic, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {CheckRead, Unread} from '@solar-icons/react-perf/Linear';
import {AnimatePresence, motion} from 'framer-motion';
import {Dispatch, ReactNode, SetStateAction} from 'react';

type AnimProp = {
  children: ReactNode;
  show: boolean;
};

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

type RenderProps = {
  item: CustomArg;
  isAdded: boolean;
  setCustomList: Dispatch<SetStateAction<CustomArg[]>>;
  addItem: (item: CustomArg) => void;
  removeItem: (item: CustomArg) => void;
};

export default function RenderCustomItem({item, isAdded, setCustomList, addItem, removeItem}: RenderProps) {
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
              {item.kind === 'envVar' ? <HomeAdd /> : <SettingsMinimalistic />}
              <span>{item.kind === 'envVar' ? 'Environment Variable' : 'Command Line'}</span>
            </div>
            <div className="flex items-center gap-x-1">
              <AnimateChild show={isAdded}>
                <Button size="sm" variant="flat" color="success" isDisabled isIconOnly>
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
                classNames={{label: 'truncate'}}
                aria-label="Select the argument type"
                label="Choose how this argument will be processed">
                <SelectItem key="Input" variant="flat" description="Text input field for free-form text entries">
                  Text Input
                </SelectItem>
                <SelectItem key="Number" variant="flat" description="Input field for numeric values only">
                  Number
                </SelectItem>
                <SelectItem variant="flat" key="Directory" description="Select a folder from the system">
                  Folder
                </SelectItem>
                <SelectItem key="File" variant="flat" description="Select a file from the system">
                  File
                </SelectItem>
                <SelectItem
                  key="CheckBox"
                  variant="flat"
                  description="Value that is either present (enabled) or absent (disabled)">
                  Boolean
                </SelectItem>
                <SelectItem key="DropDown" variant="flat" description="Select from a predefined list of values">
                  Select
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
                  aria-label="Number value"
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
            {item.type === 'DropDown' && (
              <div className="flex flex-col w-full gap-y-2">
                <div className="flex items-center gap-x-2 w-full">
                  <span className="shrink-0">Default Values:</span>
                  <Input
                    size="sm"
                    spellCheck="false"
                    onValueChange={onDefaultValueChange}
                    placeholder="Enter values comma separated (value1, value2)"
                    value={typeof item.defaultValue !== 'string' ? '' : item.defaultValue}
                    fullWidth
                    isClearable
                  />
                </div>
                {item.defaultValue && (
                  <div className="flex items-center gap-x-2">
                    {typeof item.defaultValue === 'string' &&
                      item.defaultValue.split(',').map(value => {
                        const targetValue = value.trim();

                        if (!targetValue) return null;

                        const removeValue = () => {
                          const removedResult = (item.defaultValue as string)
                            .split(',')
                            .filter(v => v !== value)
                            .map(v => v.trim());
                          onDefaultValueChange(removedResult.join(', '));
                        };

                        return (
                          <Chip size="sm" key={value} variant="flat" color="success" onClose={removeValue} isCloseable>
                            {targetValue}
                          </Chip>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      );
    case 'custom':
    case 'comment':
    default:
      return (
        <motion.div
          animate={{translateY: 0, opacity: 1, scale: 1}}
          initial={{translateY: 5, opacity: 0, scale: 0.9}}
          className="text-sm bg-background dark:bg-LynxNearBlack flex flex-col px-4 py-3 rounded-xl gap-y-2"
          layout>
          <div className="flex justify-between items-center">
            <div
              className={
                `flex items-center gap-x-2 font-semibold ` +
                `${item.kind === 'comment' ? 'text-warning-600' : 'text-success-600'}`
              }>
              {item.kind === 'comment' ? <Pen2 /> : <Notes />}
              <span>{item.kind === 'comment' ? 'Comment' : 'Custom'}</span>
            </div>
            <div className="flex items-center gap-x-1">
              <AnimateChild show={isAdded}>
                <Button size="sm" variant="flat" color="success" isDisabled isIconOnly>
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

          <div className="flex items-center gap-x-4 size-full">
            <div className="flex items-center gap-x-2">
              <span className="shrink-0">Name:</span>
              <Input size="sm" value={item.name} onValueChange={onNameChange} />
            </div>
            <div className="flex items-center gap-x-2 flex-1">
              <span className="shrink-0">{item.kind === 'comment' ? 'Comment Text' : 'Custom Data'}:</span>
              {item.kind === 'comment' ? (
                <Input
                  size="sm"
                  spellCheck="false"
                  value={item.defaultValue}
                  onValueChange={onDefaultValueChange}
                  placeholder="Enter defualt value..."
                  fullWidth
                  isClearable
                />
              ) : (
                <Textarea
                  spellCheck="false"
                  value={item.defaultValue}
                  onValueChange={onDefaultValueChange}
                  placeholder="Enter defualt value..."
                  fullWidth
                  isClearable
                />
              )}
            </div>
          </div>
        </motion.div>
      );
  }
}
