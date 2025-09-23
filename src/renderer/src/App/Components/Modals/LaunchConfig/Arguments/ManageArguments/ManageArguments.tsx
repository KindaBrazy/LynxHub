import {Button, Chip, Tooltip, useDisclosure} from '@heroui/react';
import {Empty} from 'antd';
import {AnimatePresence, Reorder} from 'framer-motion';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction} from 'react';

import {ArgumentsPresets, ChosenArgumentsData} from '../../../../../../../../cross/CrossTypes';
import {Add_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import LaunchConfigSection from '../../LaunchConfig-Section';
import ManageArgumentsItem from './ManageArguments-Item';

type Props = {
  addArgumentsModal: ReturnType<typeof useDisclosure>;
  chosenArguments: ArgumentsPresets;
  setChosenArguments: Dispatch<SetStateAction<ChosenArgumentsData>>;
  id: string;
};

/** Show selected arguments */
export default function ManageArguments({addArgumentsModal, chosenArguments, setChosenArguments, id}: Props) {
  const openAddArguments = () => addArgumentsModal.onOpen();

  const onReorder = (items: string[]) => {
    const newOrder = items.map(name => chosenArguments.arguments.find(argument => argument.name === name));
    if (newOrder.every(item => item !== undefined)) {
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
  };

  return (
    <LaunchConfigSection
      customButton={
        <Tooltip radius="sm" delay={500} content={'Add New Arguments'} showArrow>
          <Button size="sm" variant="light" onPress={openAddArguments} isIconOnly>
            <Add_Icon />
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
              className="scale-85 hover:bg-success/10 transition-colors duration-300">
              {chosenArguments.arguments.length}
            </Chip>
          )}
        </div>
      }
      description="Configurate environments and command lines">
      {isEmpty(chosenArguments.arguments) ? (
        <Empty className="m-" image={Empty.PRESENTED_IMAGE_SIMPLE} description="No item selected to display" />
      ) : (
        <AnimatePresence>
          <Reorder.Group
            axis="y"
            onReorder={onReorder}
            className="flex flex-col space-y-2 overflow-hidden"
            values={chosenArguments.arguments.map(argument => argument.name)}>
            {chosenArguments.arguments.map(argument => (
              <ManageArgumentsItem id={id} key={argument.name} argument={argument} setArguments={setChosenArguments} />
            ))}
          </Reorder.Group>
        </AnimatePresence>
      )}
    </LaunchConfigSection>
  );
}
