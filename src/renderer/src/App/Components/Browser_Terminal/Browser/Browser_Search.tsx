import {Button} from '@heroui/react';

import {Circle_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons1';
import rendererIpc from '../../../RendererIpc';

type Props = {id: string};
export default function Browser_Search({id}: Props) {
  const openSearchMenu = () => {
    rendererIpc.browser.openFindInPage(id);
  };
  return (
    <Button size="sm" variant="light" onPress={openSearchMenu} className="cursor-default" isIconOnly>
      <Circle_Icon className="size-4" />
    </Button>
  );
}
