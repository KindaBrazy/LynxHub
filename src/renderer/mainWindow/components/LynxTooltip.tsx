import {Tooltip, TooltipProps} from '@heroui/react';
import {useDisableTooltip} from '@lynx/utils/hooks';

type Props = TooltipProps & {
  /** Whether the tooltip is essential and should be shown even if tooltips are generally disabled */
  isEssential?: boolean;
};

/**
 * A wrapper around HeroUI Tooltip that respects the global tooltip disabled setting.
 * Uses `useDisableTooltip` hook to determine visibility.
 */
export default function LynxTooltip({isEssential, delay = 300, radius = 'sm', children, ...props}: Props) {
  const isDisabled = useDisableTooltip(isEssential);

  return (
    <Tooltip
      {...props}
      delay={delay}
      radius={radius}
      isDisabled={isDisabled}
      className="dark:bg-DarkGray"
      classNames={{base: 'dark:before:bg-DarkGray'}}
      showArrow>
      {children}
    </Tooltip>
  );
}
