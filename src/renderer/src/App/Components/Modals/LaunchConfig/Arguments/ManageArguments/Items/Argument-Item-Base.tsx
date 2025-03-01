import {Button} from '@heroui/react';
import {Card, Tooltip, Typography} from 'antd';
import {ReactNode, useMemo} from 'react';

import {getArgumentDescription} from '../../../../../../../../../cross/GetArgumentsData';
import {Close_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons1';
import {useGetArgumentsByID} from '../../../../../../Modules/ModuleLoader';
import {useModalsState} from '../../../../../../Redux/Reducer/ModalsReducer';

const {Text} = Typography;

type Props = {
  onClick?: () => void;
  name: string;
  removeArg: () => void;
  icon: ReactNode;
  children?: ReactNode;
  tooltipText?: string;
  defaultCursor?: boolean;
  extra?: ReactNode;
};

export default function ArgumentItemBase({
  children,
  icon,
  name,
  onClick,
  removeArg,
  defaultCursor = true,
  extra,
}: Props) {
  const {id} = useModalsState('cardLaunchConfig');

  const cardArgument = useGetArgumentsByID(id);
  const tooltipText = useMemo(() => getArgumentDescription(name, cardArgument), [name, cardArgument]);

  return (
    <Tooltip title={tooltipText} mouseEnterDelay={0.8} rootClassName="max-w-[65%] whitespace-pre-line">
      <Card
        title={
          <div className="flex flex-row space-x-2">
            <div className="flex items-center justify-center text-success">{icon}</div>
            <Text className="font-JetBrainsMono text-success">{name}</Text>
          </div>
        }
        extra={
          <div className="flex flex-row space-x-1">
            {extra}
            <Button
              size="sm"
              color="danger"
              variant="light"
              onPress={removeArg}
              className="my-1 cursor-default"
              isIconOnly>
              <Close_Icon />
            </Button>
          </div>
        }
        key={name}
        size="small"
        onClick={onClick}
        variant="borderless"
        className={`dark:bg-black/40 ${defaultCursor && 'cursor-default'}`}
        hoverable>
        {children}
      </Card>
    </Tooltip>
  );
}
