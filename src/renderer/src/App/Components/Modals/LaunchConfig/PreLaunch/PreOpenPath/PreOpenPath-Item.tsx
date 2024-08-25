import {Card} from '@nextui-org/card';
import {Button, Typography} from 'antd';
import {ReactNode, useCallback} from 'react';

import {getIconByName} from '../../../../../../assets/icons/SvgIconsContainer';

const {Text} = Typography;
type Props = {icon: ReactNode; index: number; defaultText: string; onRemove?: (index: number) => void};

/** Manage pre-opened items, display paths, and remove */
export default function PreOpenPathItem({defaultText, icon, index, onRemove}: Props) {
  const remove = useCallback(() => onRemove?.(index), [onRemove, index]);

  return (
    <Card
      radius="sm"
      shadow="none"
      className="relative flex h-[38px] flex-row items-center !transition-opacity !duration-300 hover:opacity-80">
      {icon}
      <Text ellipsis={{tooltip: defaultText}} className="absolute inset-x-10 font-JetBrainsMono">
        {defaultText}
      </Text>
      <Button
        type="text"
        size="small"
        onClick={remove}
        icon={getIconByName('Close')}
        className="absolute right-0 mx-2 cursor-default"
        danger
      />
    </Card>
  );
}
