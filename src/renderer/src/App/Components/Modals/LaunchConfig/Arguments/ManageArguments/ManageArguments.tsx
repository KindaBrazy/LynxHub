import {Button, Chip, Tooltip, useDisclosure} from '@heroui/react';
import {Empty} from 'antd';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useCallback} from 'react';

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
  const openAddArguments = useCallback(() => {
    addArgumentsModal.onOpen();
  }, [addArgumentsModal]);
  return (
    <LaunchConfigSection
      customButton={
        <Tooltip radius="sm" delay={500} content={'Add New Arguments'} showArrow>
          <Button size="sm" variant="light" className="cursor-default" onPress={openAddArguments} isIconOnly>
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
              color="success"
              className="scale-85 hover:bg-success/10 transition-colors duration-300">
              {chosenArguments.arguments.length}
            </Chip>
          )}
        </div>
      }
      description="Arguments and flags to configure AI">
      {isEmpty(chosenArguments.arguments) ? (
        <Empty className="m-0" image={Empty.PRESENTED_IMAGE_SIMPLE} description="No arguments available to display" />
      ) : (
        <div className="flex flex-col space-y-2">
          {chosenArguments.arguments.map(argument => (
            <ManageArgumentsItem
              id={id}
              argument={argument}
              key={`${argument.name}_Item`}
              setArguments={setChosenArguments}
            />
          ))}
        </div>
      )}
    </LaunchConfigSection>
  );
}
