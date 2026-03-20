import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {getTitleById} from '@lynx/plugins/modules';
import {ArgumentType} from '@lynx_common/types/plugins/modules';
import {HomeAdd, Inbox, Notes, Pen2, SettingsMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {AnimatePresence, motion} from 'framer-motion';
import {some} from 'lodash';
import {Plus} from 'lucide-react';
import {Dispatch, memo, SetStateAction, useEffect, useState} from 'react';

import EmptyStateCard from '../../../../../EmptyStateCard';
import RenderCustomItem from './RenderItem';

export type ItemKinds = 'envVar' | 'commandLine' | 'custom' | 'comment';
export type CustomItem = {name: string; kind: ItemKinds; type: ArgumentType; defaultValue?: any};

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

type Props = {
  title: string;
  description: string;
  list: CustomItem[];
  setList: Dispatch<SetStateAction<CustomItem[]>>;
};

const CustomArg = memo(({title, description, list, setList}: Props) => {
  const [addedList, setAddedList] = useState<CustomItem[]>([]);

  const addCustom = (itemKind: ItemKinds) => {
    setList(prevState => {
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
        case 'custom':
          baseName = 'custom';
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
    setList(prevState => prevState.filter(listItem => listItem.name !== item.name));
  };

  return (
    <div className="flex flex-col relative gap-y-2">
      <div className="bg-foreground-100 rounded-xl flex flex-col inset-0 items-center p-4 relative">
        <div className="size-full flex justify-center mb-4">
          <div className="flex flex-col text-center">
            <span className="font-bold">{title}</span>
            <span className="font-semibold text-foreground-500 text-xs">{description}</span>
          </div>
          <Dropdown showArrow>
            <DropdownTrigger>
              <Button size="sm" variant="light" className="absolute right-3 top-3" isIconOnly>
                <Plus className="size-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="envVar" startContent={<HomeAdd />} onPress={() => addCustom('envVar')}>
                Environment Variable
              </DropdownItem>
              <DropdownItem
                key="commandLine"
                startContent={<SettingsMinimalistic />}
                onPress={() => addCustom('commandLine')}>
                Command Line
              </DropdownItem>
              <DropdownItem key="custom" startContent={<Notes />} onPress={() => addCustom('custom')}>
                Custom
              </DropdownItem>
              <DropdownItem key="comment" startContent={<Pen2 />} onPress={() => addCustom('comment')}>
                Comment
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="w-full flex flex-col gap-y-2">
          <AnimatePresence mode="popLayout">
            {list.length === 0 ? (
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
              list.map(item => (
                <RenderCustomItem
                  item={item}
                  key={item.name}
                  addItem={addItem}
                  isAdded={isAdded(item)}
                  removeItem={removeItem}
                  setCustomList={setList}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

export default function CustomArguments({id}: {id: string}) {
  const [globalList, setGlobalList] = useState<CustomItem[]>([]);
  const [perCardList, setPerCardList] = useState<CustomItem[]>([]);

  const [title, setTitle] = useState<string>();

  useEffect(() => {
    const cardTitle = getTitleById(id);
    setTitle(cardTitle);
  }, [id]);

  return (
    <div className="flex flex-col relative gap-y-2">
      <CustomArg title="Global" list={globalList} setList={setGlobalList} description="Access these all over app" />
      <CustomArg
        list={perCardList}
        setList={setPerCardList}
        title={title + ' Specified'}
        description={'Specified for ' + title}
      />
    </div>
  );
}
