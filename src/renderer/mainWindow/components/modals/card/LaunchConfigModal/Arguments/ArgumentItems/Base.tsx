import {Button, Card, CardBody, CardHeader, Divider, Tooltip} from '@heroui/react';
import {TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {Reorder, useDragControls} from 'framer-motion';
import {GripVertical} from 'lucide-react';
import {ReactNode, useMemo} from 'react';

import {useGetArgumentsByID} from '../../../../../../plugins/modules';
import {getArgumentDescription} from '../../../../../../utils/moduleArguments';

type Props = {
  onClick?: () => void;
  name: string;
  removeArg: () => void;
  icon: ReactNode;
  children?: ReactNode;
  tooltipText?: string;
  defaultCursor?: boolean;
  extra?: ReactNode;
  id: string;
};

/**
 * Base component for argument items in the Launch Config modal.
 * Handles drag-and-drop reordering, tooltip display, and the common card layout.
 */
export default function ArgumentItemBase({
  children,
  icon,
  name,
  onClick,
  removeArg,
  defaultCursor = true,
  extra,
  id,
}: Props) {
  const cardArgument = useGetArgumentsByID(id);
  const tooltipText = useMemo(() => getArgumentDescription(name, cardArgument), [name, cardArgument]);

  const controls = useDragControls();

  return (
    <Reorder.Item
      value={name}
      dragListener={false}
      dragControls={controls}
      className="flex flex-row items-stretch size-full">
      <div
        className={
          'w-5 active:cursor-grabbing cursor-grab text-foreground-500 hover:text-foreground-600 transition-all' +
          ' duration-300 flex items-center justify-center dark:bg-foreground-50 bg-white rounded-l-medium relative'
        }
        onPointerDown={e => controls.start(e)}>
        <GripVertical className="size-4" />
        <Divider orientation="vertical" className="absolute right-0 bg-LynxWhiteSecond dark:bg-LynxRaisinBlack" />
      </div>
      <Tooltip
        delay={800}
        placement="top"
        content={tooltipText}
        isDisabled={!tooltipText}
        classNames={{content: 'max-w-[65%] whitespace-pre-line'}}
        showArrow>
        <Card
          as="div"
          key={name}
          shadow="none"
          isPressable={!!onClick && !defaultCursor}
          onPress={defaultCursor ? undefined : onClick}
          className={`${defaultCursor ? 'cursor-default' : ''} rounded-l-none`}
          fullWidth>
          <CardHeader className={`justify-between pt-1 ${children ? 'pb-0' : 'pb-1'} text-xs`}>
            <div className="flex gap-x-1 text-success">
              <div className="flex items-center justify-center">{icon}</div>
              <span className="font-JetBrainsMono font-semibold">{name}</span>
            </div>
            <div className="flex flex-row items-center gap-x-1">
              {extra}
              <Button
                size="sm"
                color="danger"
                variant="light"
                onPress={removeArg}
                aria-label="Remove argument"
                isIconOnly>
                <TrashBin2 className="size-3.5" />
              </Button>
            </div>
          </CardHeader>
          {children && <CardBody className="p-2">{children}</CardBody>}
        </Card>
      </Tooltip>
    </Reorder.Item>
  );
}
