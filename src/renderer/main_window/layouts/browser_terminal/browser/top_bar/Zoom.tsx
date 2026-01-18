import {Button} from '@heroui/react';
import rendererIpc from '@lynx_shared/ipc';
import {useRef} from 'react';

import {Magnifier_Icon} from '../../../../../shared/assets/icons';

type Props = {id: string};
export default function Browser_Zoom({id}: Props) {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const openZoomMenu = () => {
    const bounds = btnRef.current?.getBoundingClientRect();
    if (bounds) {
      const {x, y} = bounds;
      rendererIpc.browser.openZoom(id, {x: x - 125, y: y + 30});
    } else {
      rendererIpc.browser.openZoom(id);
    }
  };

  return (
    <Button size="sm" ref={btnRef} variant="light" onPress={openZoomMenu} className="cursor-default" isIconOnly>
      <Magnifier_Icon className="size-4" />
    </Button>
  );
}
