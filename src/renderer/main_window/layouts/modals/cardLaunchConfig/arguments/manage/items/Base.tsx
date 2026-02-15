import {Button, Card, CardBody, CardHeader, Divider} from '@heroui/react';
import {useGetArgumentsByID} from '@lynx/plugins/modules';
import {getArgumentDescription} from '@lynx/utils/moduleArguments';
import {TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {Tooltip} from 'antd';
import {Reorder, useDragControls} from 'framer-motion';
import {GripVertical} from 'lucide-react';
import {ReactNode, useMemo} from 'react';

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
      className="flex flex-row items-scratch size-full">
      <div
        className={
          'w-7 active:cursor-grabbing cursor-grab text-foreground-500 hover:text-foreground-600 transition-all ' +
          ' duration-300 flex items-center justify-center dark:bg-foreground-50 bg-white rounded-l-medium' +
          ' relative'
        }
        onPointerDown={e => controls.start(e)}>
        <GripVertical className="size-4" />
        <Divider orientation="vertical" className="absolute right-0 bg-LynxWhiteSecond dark:bg-LynxRaisinBlack" />
      </div>
      <Tooltip title={tooltipText} mouseEnterDelay={0.8} rootClassName="max-w-[65%] whitespace-pre-line">
        <Card
          as="div"
          key={name}
          shadow="none"
          isPressable={!!onClick && !defaultCursor}
          onPress={defaultCursor ? undefined : onClick}
          className={`${defaultCursor && 'cursor-default'} rounded-l-none`}
          fullWidth>
          <CardHeader className={`justify-between ${children ? 'pb-1' : 'pb-2'} pt-2 text-sm`}>
            <div className="flex gap-x-2 text-success">
              <div className="flex items-center justify-center">{icon}</div>
              <span className="font-JetBrainsMono">{name}</span>
            </div>
            <div className="flex flex-row items-center gap-x-1">
              {extra}
              <Button size="sm" color="danger" variant="light" onPress={removeArg} isIconOnly>
                <TrashBin2 className="size-3.5" />
              </Button>
            </div>
          </CardHeader>
          {children && <CardBody className="pt-1">{children}</CardBody>}
        </Card>
      </Tooltip>
    </Reorder.Item>
  );
}
