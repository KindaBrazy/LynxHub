import {Button} from '@heroui/react';

import {Magnifier_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons4';
import rendererIpc from '../../../RendererIpc';

type Props = {id: string};
export default function Browser_Zoom({id}: Props) {
  const openZoomMenu = () => {
    rendererIpc.browser.openZoom(id);
  };

  return (
    <Button size="sm" variant="light" onPress={openZoomMenu} className="cursor-default" isIconOnly>
      <Magnifier_Icon className="size-4" />
    </Button>
  );
}
