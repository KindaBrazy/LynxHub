import {Button} from '@heroui/react';
import {Card, Tooltip, Typography} from 'antd';
import {useMemo} from 'react';

import {ChosenArgument} from '../../../../../../../../../cross/CrossTypes';
import {getArgumentDescription} from '../../../../../../../../../cross/GetArgumentsData';
import {CheckBox_Icon, Close_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons1';
import {useGetArgumentsByID} from '../../../../../../Modules/ModuleLoader';
import {useModalsState} from '../../../../../../Redux/AI/ModalsReducer';

const {Text} = Typography;
type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void};

export default function CheckBoxArgItem({argument, removeArg}: Props) {
  const {id} = useModalsState('cardLaunchConfig');

  const cardArgument = useGetArgumentsByID(id);

  const tooltipText = useMemo(() => getArgumentDescription(argument.name, cardArgument), [argument, cardArgument]);

  return (
    <Tooltip title={tooltipText} mouseEnterDelay={0.5} rootClassName="max-w-[65%] whitespace-pre-line">
      <Card
        variant="borderless"
        className="cursor-default dark:bg-black/40"
        classNames={{body: 'flex-row items-center flex'}}
        hoverable>
        <CheckBox_Icon className="text-success absolute left-3" />
        <Text className="absolute left-8 right-12 font-JetBrainsMono text-success">{argument.name}</Text>
        <Button
          size="sm"
          color="danger"
          variant="light"
          onPress={removeArg}
          className="absolute right-3 cursor-default"
          isIconOnly>
          <Close_Icon />
        </Button>
      </Card>
    </Tooltip>
  );
}
