import {Button} from '@heroui/react';
import {Magnifier_Icon} from '@lynx_assets/icons';
import browserIpc from '@lynx_shared/ipc/browser';
import {useRef} from 'react';

type Props = {id: string};
export default function Browser_Zoom({id}: Props) {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const openZoomMenu = () => {
    const bounds = btnRef.current?.getBoundingClientRect();
    if (bounds) {
      const {x, y} = bounds;
      browserIpc.send.openZoom(id, {x: x - 125, y: y + 30});
    } else {
      browserIpc.send.openZoom(id);
    }
  };

  return (
    <Button size="sm" ref={btnRef} variant="light" onPress={openZoomMenu} className="cursor-default" isIconOnly>
      <Magnifier_Icon className="size-4" />
    </Button>
  );
}
