import {Button, Tooltip} from '@heroui/react';
import {useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {TabInfo} from '../../../../../cross/CrossTypes';
import {Hotkey_Names} from '../../../../../cross/HotkeyConstants';
import {CloseSimple_Icon} from '../../../assets/icons/SvgIcons/SvgIcons';
import {useCardsState} from '../../Redux/Reducer/CardsReducer';
import {useHotkeysState} from '../../Redux/Reducer/HotkeysReducer';
import {useSettingsState} from '../../Redux/Reducer/SettingsReducer';
import {tabsActions, useTabsState} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import useHotkeyPress from '../../Utils/RegisterHotkeys';
import {useRemoveTab} from './Tab_Utils';
import TabItem_Icon from './TabItem_Icon';
import TabTitle from './TabTitle';

type Props = {
  tab: TabInfo;
};

export default function TabItem({tab}: Props) {
  const isCtrlPressed = useHotkeysState('isCtrlPressed');
  const activeTab = useTabsState('activeTab');
  const runningCards = useCardsState('runningCard');
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const closeTabConfirm = useSettingsState('closeTabConfirm');

  const removeTab = useRemoveTab();

  const handleRemove = (isHokey: boolean) => {
    const running = runningCards.find(card => card.tabId === tab.id);
    if (running) {
      if (running.type === 'browser') {
        removeTab(tab.id);
      } else {
        if (isCtrlPressed || !closeTabConfirm) {
          removeTab(tab.id);
        } else {
          const bounds = closeBtnRef.current?.getBoundingClientRect();
          if (bounds && isHokey) {
            rendererIpc.contextMenu.openTerminateTab(tab.id, {x: bounds.x, y: bounds.y});
          } else {
            rendererIpc.contextMenu.openTerminateTab(tab.id);
          }
        }
      }
    } else {
      removeTab(tab.id);
    }
  };

  const handleEvent = (e: MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      handleRemove(false);
    }
  };

  useHotkeyPress([{name: Hotkey_Names.closeTab, method: activeTab === tab.id ? () => handleRemove(true) : null}]);

  useEffect(() => {
    if (btnRef.current) {
      btnRef.current.addEventListener('auxclick', handleEvent);
    }

    return () => {
      if (btnRef.current) {
        btnRef.current.removeEventListener('auxclick', handleEvent);
      }
    };
  }, [btnRef, handleEvent]);

  const onPress = () => dispatch(tabsActions.setActiveTab(tab.id));

  const [isTruncated, setIsTruncated] = useState<boolean>(false);

  return (
    <Tooltip
      delay={300}
      radius="sm"
      offset={-2}
      placement="bottom"
      content={tab.title}
      isDisabled={!isTruncated}
      classNames={{content: 'bg-foreground-100', base: 'before:dark:bg-foreground-100'}}
      showArrow>
      <Button
        className={
          'pr-0 text-small pl-2 flex !rounded-t-lg data-[hover=true]:bg-foreground-100 flex-row ' +
          `cursor-default gap-x-0 ${activeTab == tab.id && 'bg-white dark:bg-[#303033]'}`
        }
        ref={btnRef}
        radius="none"
        variant="light"
        onPress={onPress}>
        <div className="flex gap-x-1 flex-row items-center min-w-0 flex-1">
          <TabItem_Icon tab={tab} currentView={runningCards.find(card => card.tabId === tab.id)?.currentView} />
          <TabTitle title={tab.title} setIsTruncated={setIsTruncated} />
        </div>

        <Button
          as="span"
          size="sm"
          variant="light"
          ref={closeBtnRef}
          onPress={() => handleRemove(false)}
          className="scale-75 cursor-default"
          isIconOnly>
          <CloseSimple_Icon className="size-4" />
        </Button>
      </Button>
    </Tooltip>
  );
}
