import {Card} from '@heroui/card';
import {Button, Typography} from 'antd';
import {ReactNode, useCallback} from 'react';

import {Close_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons1';

const {Text} = Typography;
type Props = {icon: ReactNode; index: number; defaultText: string; onRemove?: (index: number) => void};

/** Manage pre-opened items, display paths, and remove */
export default function PreOpenPathItem({defaultText, icon, index, onRemove}: Props) {
  const remove = useCallback(() => onRemove?.(index), [onRemove, index]);

  return (
    <Card
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
        icon={<Close_Icon />}
        className="absolute right-0 mx-2 cursor-default"
        danger
      />
    </Card>
  );
}
