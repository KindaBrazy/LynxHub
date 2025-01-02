import {cn, Switch} from '@nextui-org/react';
import {ReactNode, useCallback, useEffect, useMemo, useState} from 'react';

type Props = {
  enabled?: boolean;
  onEnabledChange?: (selected: boolean) => void;
  title: string;
  description?: string | ReactNode;
  isDisabled?: boolean;
  className?: string;
  size?: 'sm' | 'default';
};

/** Customizable switch with title and description. */
export default function LynxSwitch({
  enabled = false,
  onEnabledChange,
  title,
  description,
  isDisabled,
  className,
  size = 'default',
}: Props) {
  const [isSelected, setIsSelected] = useState<boolean>(enabled);

  useEffect(() => {
    setIsSelected(enabled);
  }, [enabled]);

  const onChange = useCallback(
    (selected: boolean) => {
      setIsSelected(selected);
      onEnabledChange?.(selected);
    },
    [onEnabledChange],
  );

  const baseClassName = useMemo(() => {
    return cn(
      'inline-flex flex-row-reverse w-full max-w-full items-center',
      'dark:bg-default-100 bg-default-200 dark:hover:bg-default-200 hover:bg-default-100',
      'justify-between cursor-pointer rounded-lg gap-2 transition duration-300',
      size === 'sm' ? 'px-2 py-1' : 'px-4 py-2.5',
      'border-2 border-transparent data-[selected=true]:border-secondary/40',
    );
  }, [size]);

  const wrapperClassName = useMemo(() => {
    return `p-0 ${size === 'sm' ? 'w-8 h-2' : 'w-10 h-3.5'} bg-foreground-300 overflow-visible`;
  }, [size]);

  const thumbClassName = useMemo(() => {
    return cn(
      size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
      'shadow-md bg-white dark:bg-white',
      `group-data-[selected=true]:${size === 'sm' ? 'ml-4' : 'ml-5'}`,
      'group-data-[pressed=true]:w-7 shrink-0',
      'group-data-[selected]:group-data-[pressed]:ml-4',
    );
  }, [size]);

  return (
    <Switch
      classNames={{
        base: baseClassName,
        wrapper: wrapperClassName,
        thumb: thumbClassName,
      }}
      color="secondary"
      isSelected={isSelected}
      isDisabled={isDisabled}
      onValueChange={onChange}
      className={'cursor-default whitespace-pre-line ' + className}>
      <div className="flex flex-col gap-1">
        <p className="text-sm">{title}</p>
        {description && <p className="text-tiny text-default-400">{description}</p>}
      </div>
    </Switch>
  );
}
