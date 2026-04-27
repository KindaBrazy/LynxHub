import {Button, Card, Tooltip} from '@heroui-v3/react';
import {isEmpty, isString} from 'lodash';
import {Plus} from 'lucide-react';
import {ReactNode} from 'react';

type Props = {
  /** The content of the section */
  children: ReactNode;
  /** The title of the section */
  title: ReactNode;
  /** Optional description text */
  description?: string;
  /** Callback when the add button is pressed */
  onAddPress?: () => void;
  /** Tooltip text for the add button */
  addTooltipTitle?: string;
  /** Custom button element to replace the default add button */
  customButton?: ReactNode;
};

/**
 * Display card containing configurations for Launch Config Modal.
 * Provides a consistent layout with title, description, and action button.
 */
export default function LaunchConfigSection({
  children,
  title,
  description,
  onAddPress,
  addTooltipTitle,
  customButton,
}: Props) {
  return (
    <Card variant="secondary">
      <Card.Header className="px-4 flex-col items-start">
        <div className="flex w-full flex-row items-center justify-between text-foreground font-semibold">
          {isString(title) ? <span>{title}</span> : title}
          {customButton || (
            <Tooltip delay={300}>
              <Tooltip.Trigger>
                <Button size="sm" variant="ghost" onPress={onAddPress} isIconOnly>
                  <Plus className="size-4" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content showArrow>
                <Tooltip.Arrow />
                <p>{addTooltipTitle}</p>
              </Tooltip.Content>
            </Tooltip>
          )}
        </div>
        {!isEmpty(description) && <span className="text-xs text-muted">{description}</span>}
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card>
  );
}
