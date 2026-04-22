import {Button} from '@heroui-v3/react';
import useHotkeyPress from '@lynx/hooks/hotkeys';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {Circle_Icon} from '@lynx_assets/icons';
import {Hotkey_Names} from '@lynx_common/consts/hotkeys';
import browserIpc from '@lynx_shared/ipc/browser';
import {memo, useRef} from 'react';

import LynxTooltip from '../../../../components/LynxTooltip';

type Props = {
  /**
   * The ID of the browser/card.
   */
  id: string;
  /**
   * The ID of the tab.
   */
  tabID: string;
};

/**
 * A button to open the "Find in Page" dialog.
 */
const BrowserSearch = memo(({id, tabID}: Props) => {
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
    <LynxTooltip delay={1000} content="Find in Page">
      <Button size="sm" ref={btnRef} variant="ghost" onPress={openSearchMenu} aria-label="Find in Page" isIconOnly>
        <Circle_Icon className="size-4" />
      </Button>
    </LynxTooltip>
  );
});

BrowserSearch.displayName = 'BrowserSearch';

export default BrowserSearch;
