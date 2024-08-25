import {Button} from '@nextui-org/react';
import {Card, Tooltip, Typography} from 'antd';
import {ReactNode, useMemo} from 'react';

import {getArgumentDescription} from '../../../../../../../../../cross/GetArgumentsData';
import {getIconByName, IconNameType} from '../../../../../../../assets/icons/SvgIconsContainer';
import {useModules} from '../../../../../../Modules/ModulesContext';
import {useModalsState} from '../../../../../../Redux/AI/ModalsReducer';

const {Text} = Typography;

type Props = {
  onClick?: () => void;
  name: string;
  removeArg: () => void;
  icon: IconNameType;
  children?: ReactNode;
  tooltipText?: string;
  defaultCursor?: boolean;
};

export default function ArgumentItemBase({children, icon, name, onClick, removeArg, defaultCursor = true}: Props) {
  const {id} = useModalsState('cardLaunchConfig');
  const {getArgumentsByID} = useModules();

  const tooltipText = useMemo(() => getArgumentDescription(name, getArgumentsByID(id)), [name]);

  return (
    <Tooltip title={tooltipText} mouseEnterDelay={0.5} rootClassName="max-w-[65%] whitespace-pre-line">
      <Card
        title={
          <div className="flex flex-row space-x-2">
            <div className="flex items-center justify-center text-success">{getIconByName(icon)}</div>
            <Text className="font-JetBrainsMono text-success">{name}</Text>
          </div>
        }
        extra={
          <Button
            size="sm"
            color="danger"
            variant="light"
            onPress={removeArg}
            className="my-1 cursor-default"
            isIconOnly>
            {getIconByName('Close')}
          </Button>
        }
        key={name}
        size="small"
        bordered={false}
        onClick={onClick}
        className={`dark:bg-black/40 ${defaultCursor && 'cursor-default'}`}
        hoverable>
        {children}
      </Card>
    </Tooltip>
  );
}
