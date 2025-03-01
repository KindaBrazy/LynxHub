import {Button} from '@heroui/react';
import {ReactNode, useEffect, useRef} from 'react';

import {Terminal_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';
import {CloseSimple_Icon} from '../../../assets/icons/SvgIcons/SvgIcons5';

type Props = {
  title?: string;
  isSelected?: boolean;
  icon?: ReactNode;
  isTerminal?: boolean;
  setIsSelected: (selected: string) => void;
  removeTab: () => void;
};

export default function TabItem({title, icon, isSelected, isTerminal, setIsSelected, removeTab}: Props) {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (btnRef.current) {
      btnRef.current.addEventListener('auxclick', (e: MouseEvent) => {
        if (e.button === 1) {
          e.preventDefault();
          removeTab();
        }
      });
    }
  }, [btnRef]);

  const onPress = () => setIsSelected(title || '');

  return (
    <Button
      className={
        'pr-0 text-small pl-2 flex rounded-t-lg data-[hover=true]:bg-foreground-100 flex-row cursor-default gap-x-0 ' +
        `${isSelected && 'bg-white dark:bg-[#303033]'}`
      }
      ref={btnRef}
      radius="none"
      variant="light"
      onPress={onPress}>
      <div className="flex gap-x-1 flex-row items-center min-w-0 flex-1">
        {isTerminal && <Terminal_Icon className="opacity-70 shrink-0" />}
        <div className="shrink-0 size-4 content-center">{icon}</div>
        <span className="truncate">{title}</span>
      </div>

      <Button as="span" size="sm" variant="light" onPress={removeTab} className="scale-75 cursor-default" isIconOnly>
        <CloseSimple_Icon className="size-4" />
      </Button>
    </Button>
  );
}
