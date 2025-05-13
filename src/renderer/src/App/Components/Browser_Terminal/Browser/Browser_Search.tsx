import {Button} from '@heroui/react';
import {useRef} from 'react';

import {Hotkey_Names} from '../../../../../../cross/HotkeyConstants';
import {Circle_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons1';
import rendererIpc from '../../../RendererIpc';
import useHotkeyPress from '../../../Utils/RegisterHotkeys';

type Props = {id: string};
export default function Browser_Search({id}: Props) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const openSearchMenu = () => {
    const bounds = btnRef.current?.getBoundingClientRect();
    if (bounds) {
      const {x, y} = bounds;
      rendererIpc.browser.openFindInPage(id, {x: x - 125, y: y + 17});
    } else {
      rendererIpc.browser.openFindInPage(id);
    }
  };

  useHotkeyPress([{name: Hotkey_Names.findInPage, method: openSearchMenu}]);

  return (
    <Button size="sm" ref={btnRef} variant="light" onPress={openSearchMenu} className="cursor-default" isIconOnly>
      <Circle_Icon className="size-4" />
    </Button>
  );
}
