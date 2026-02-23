import {Button, Tooltip} from '@heroui/react';
import browserIpc from '@lynx_shared/ipc/browser';
import {MagniferZoomIn} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useEffect, useRef} from 'react';

type Props = {
  /**
   * The ID of the browser/card.
   */
  id: string;
};

/**
 * A button to control the zoom level of the browser tab.
 */
const BrowserZoom = memo(({id}: Props) => {
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
    <Tooltip delay={1000} content="Zoom Control">
      <Button
        size="sm"
        ref={btnRef}
        variant="light"
        onPress={openZoomMenu}
        aria-label="Zoom Control"
        className="cursor-default"
        isIconOnly>
        <MagniferZoomIn className="size-4" />
      </Button>
    </Tooltip>
  );
});

BrowserZoom.displayName = 'BrowserZoom';

export default BrowserZoom;
