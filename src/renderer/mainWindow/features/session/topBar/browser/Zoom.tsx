import {Button} from '@heroui/react';
import browserIpc from '@lynx_shared/ipc/browser';
import {MagniferZoomIn} from '@solar-icons/react-perf/BoldDuotone';
import {useEffect, useRef} from 'react';

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

  useEffect(() => {
    const removeListener = browserIpc.on.onZoomChanged((eventId, _) => {
      if (eventId === id) {
        openZoomMenu();
      }
    });
    return () => {
      removeListener();
    };
  }, [id]);

  return (
    <Button size="sm" ref={btnRef} variant="light" onPress={openZoomMenu} className="cursor-default" isIconOnly>
      <MagniferZoomIn className="size-4" />
    </Button>
  );
}
