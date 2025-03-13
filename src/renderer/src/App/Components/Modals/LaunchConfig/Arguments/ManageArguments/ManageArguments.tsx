import {Button, useDisclosure} from '@heroui/react';
import {Empty} from 'antd';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useCallback} from 'react';

import {ArgumentsPresets, ChosenArgumentsData} from '../../../../../../../../cross/CrossTypes';
import {Add_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons1';
import LynxTooltip from '../../../../Reusable/LynxTooltip';
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
        <LynxTooltip content="Add New Arguments" isEssential>
          <Button size="sm" variant="light" className="cursor-default" onPress={openAddArguments} isIconOnly>
            <Add_Icon />
          </Button>
        </LynxTooltip>
      }
      title="Arguments"
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
