import {Tooltip} from '@heroui/react';
import {ReactNode} from 'react';
import {UNSAFE_PortalProvider} from 'react-aria';

type Props = {children: ReactNode; content: ReactNode; delay?: number; isDisabled?: boolean; triggerClassName?: string};

export default function LynxTooltip({children, content, delay = 300, isDisabled, triggerClassName}: Props) {
  return (
    <UNSAFE_PortalProvider getContainer={() => document.body}>
      <Tooltip delay={delay} isDisabled={isDisabled}>
        <Tooltip.Trigger className={triggerClassName}>{children}</Tooltip.Trigger>
        <Tooltip.Content showArrow>
          <Tooltip.Arrow />
          <p>{content}</p>
        </Tooltip.Content>
      </Tooltip>
    </UNSAFE_PortalProvider>
  );
}
