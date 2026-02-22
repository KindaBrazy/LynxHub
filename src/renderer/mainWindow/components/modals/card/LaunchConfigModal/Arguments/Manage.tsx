import {Button, Chip, Tooltip, useDisclosure} from '@heroui/react';
import {ArgumentsPresets, ChosenArgument, ChosenArgumentsData} from '@lynx_common/types';
import {Empty} from 'antd';
import {AnimatePresence, Reorder} from 'framer-motion';
import {isEmpty} from 'lodash';
import {Plus} from 'lucide-react';
import {Dispatch, SetStateAction, useCallback} from 'react';

import LaunchConfigSection from '../LaunchConfigSection';
import ManageArgumentsItem from './ManageItem';

type Props = {
  addArgumentsModal: ReturnType<typeof useDisclosure>;
  chosenArguments: ArgumentsPresets;
  setChosenArguments: Dispatch<SetStateAction<ChosenArgumentsData>>;
  id: string;
};

/**
 * Show selected arguments and allow reordering.
 */
export default function ManageArguments({addArgumentsModal, chosenArguments, setChosenArguments, id}: Props) {
  const openAddArguments = useCallback(() => addArgumentsModal.onOpen(), [addArgumentsModal]);

  const onReorder = useCallback(
    (items: string[]) => {
      const newOrder = items
        .map(name => chosenArguments.arguments.find(argument => argument.name === name))
        .filter((item): item is ChosenArgument => item !== undefined);

      if (newOrder.length === items.length) {
        setChosenArguments(prevState => {
          const data = prevState.data.map(arg => {
            if (arg.preset === prevState.activePreset) {
              return {...arg, arguments: newOrder};
            }
            return arg;
          });
          return {...prevState, data};
        });
      }
    },
    [chosenArguments.arguments, setChosenArguments]
  );

  return (
    <LaunchConfigSection
      customButton={
        <Tooltip radius="sm" delay={500} content={'Add New Arguments'} showArrow>
          <Button size="sm" variant="light" onPress={openAddArguments} isIconOnly>
            <Plus className="size-4" />
          </Button>
        </Tooltip>
      }
      title={
        <div className="flex flex-row items-center gap-x-1">
          <span>Arguments</span>
          {chosenArguments.arguments.length > 0 && (
            <Chip
              size="sm"
              radius="full"
              variant="flat"
              className="scale-85 hover:bg-success/10 transition-colors duration-300"
            >
              {chosenArguments.arguments.length}
            </Chip>
          )}
        </div>
      }
      description="Configurate environments and command lines"
    >
      {isEmpty(chosenArguments.arguments) ? (
        <Empty
          className="m-"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No item selected to display"
        />
      ) : (
        <AnimatePresence>
          <Reorder.Group
            axis="y"
            onReorder={onReorder}
            className="flex flex-col space-y-2 overflow-hidden"
            values={chosenArguments.arguments.map(argument => argument.name)}
          >
            {chosenArguments.arguments.map(argument => (
              <ManageArgumentsItem
                id={id}
                key={argument.name}
                argument={argument}
                setArguments={setChosenArguments}
              />
            ))}
          </Reorder.Group>
        </AnimatePresence>
      )}
    </LaunchConfigSection>
  );
}
