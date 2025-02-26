import {Button} from '@heroui/react';
import {ReactNode} from 'react';

import {Terminal_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';
import {CloseSimple_Icon} from '../../../assets/icons/SvgIcons/SvgIcons5';

type Props = {
  title?: string;
  isSelected?: boolean;
  icon?: ReactNode;
  isTerminal?: boolean;
  setIsSelected: (selected: string) => void;
};

export default function TabItem({title, icon, isSelected, isTerminal, setIsSelected}: Props) {
  return (
    <Button
      className={
        'h-full group rounded-t-lg max-w-60 min-w-[3.3rem] items-center pr-0 ' +
        'overflow-hidden text-small pl-2 flex data-[hover=true]:bg-foreground-100 flex-row relative cursor-default ' +
        `${isSelected && 'bg-white dark:bg-[#303033]'}`
      }
      radius="none"
      variant="light"
      onPress={() => setIsSelected(title || '')}>
      <div className="flex gap-x-2 flex-row items-center min-w-0 flex-1">
        {isTerminal && <Terminal_Icon className="opacity-70 shrink-0" />}
        <div className="shrink-0 size-4 content-center">{icon}</div>
        <span className="truncate">{title}</span>
      </div>

      <Button as="span" size="sm" variant="light" className="scale-75 cursor-default" isIconOnly>
        <CloseSimple_Icon className="size-4" />
      </Button>
    </Button>
  );
}
