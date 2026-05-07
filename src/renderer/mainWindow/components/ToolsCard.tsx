import {Avatar, Card, Description, Label} from '@heroui/react';
import {getFallbackString} from '@lynx_common/utils';
import {ReactNode} from 'react';

type Props = {title: string; description: string; icon: string; onPress: () => void; footer?: ReactNode};

/**
 * A card component for the Tools page, featuring a spotlight effect and hover animations.
 */
export function ToolsCard({title, description, icon, onPress, footer}: Props) {
  return (
    <Card
      className={
        `w-75 h-46 relative group transform border border-surface ` +
        ' hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer'
      }
      onClick={onPress}>
      <Card.Header>
        <div className="inline-flex items-center gap-2">
          <Avatar className={`size-12 shrink-0 ring-LynxPurple ring-2`}>
            <Avatar.Image src={icon} alt={title} />
            <Avatar.Fallback>{getFallbackString(title)}</Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col">
            <Label>{title}</Label>
          </div>
        </div>
      </Card.Header>
      <Card.Content>
        <Description className="line-clamp-3 text-xs">{description}</Description>
      </Card.Content>

      <Card.Footer>{footer}</Card.Footer>
    </Card>
  );
}
