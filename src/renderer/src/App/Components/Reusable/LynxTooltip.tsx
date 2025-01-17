import {Tooltip, TooltipProps} from '@heroui/react';

import {useDisableTooltip} from '../../Utils/UtilHooks';

type Props = TooltipProps & {
  isEssential?: boolean;
};

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
