import {Tooltip} from '@heroui-v3/react';
import {ReactNode} from 'react';

type Props = {children: ReactNode; content: ReactNode; delay?: number};

export default function LynxTooltip({children, content, delay = 300}: Props) {
  return (
    <Tooltip delay={delay}>
      <Tooltip.Trigger>{children}</Tooltip.Trigger>
      <Tooltip.Content showArrow>
        <Tooltip.Arrow />
        <p>{content}</p>
      </Tooltip.Content>
    </Tooltip>
  );
}
