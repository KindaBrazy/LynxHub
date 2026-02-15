import {Button} from '@heroui/react';
import useHotkeyPress from '@lynx/hooks/hotkeys';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {Circle_Icon} from '@lynx_assets/icons';
import {Hotkey_Names} from '@lynx_common/consts/hotkeys';
import browserIpc from '@lynx_shared/ipc/browser';
import {memo, useRef} from 'react';

type Props = {id: string; tabID: string};

const Browser_Search = memo(({id, tabID}: Props) => {
  const activeTab = useTabsState('activeTab');
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const openSearchMenu = () => {
    const bounds = btnRef.current?.getBoundingClientRect();
    if (bounds) {
      const {x, y} = bounds;
      browserIpc.send.openFindInPage(id, {x: x - 125, y: y + 30});
    } else {
      browserIpc.send.openFindInPage(id);
    }
  };

  useHotkeyPress([{name: Hotkey_Names.findInPage, method: tabID === activeTab ? openSearchMenu : null}]);

  return (
    <Button size="sm" ref={btnRef} variant="light" onPress={openSearchMenu} className="cursor-default" isIconOnly>
      <Circle_Icon className="size-4" />
    </Button>
  );
});

export default Browser_Search;
