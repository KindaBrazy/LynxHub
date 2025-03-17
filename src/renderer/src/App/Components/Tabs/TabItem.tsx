import {Button, Spinner} from '@heroui/react';
import {useEffect, useMemo, useRef} from 'react';
import {useDispatch} from 'react-redux';

import {TabInfo} from '../../../../../cross/CrossTypes';
import {AudioGeneration_Icon, Extensions_Icon, Extensions2_Icon} from '../../../assets/icons/SvgIcons/SvgIcons1';
import {Home_Icon, ImageGeneration_Icon, Info_Icon} from '../../../assets/icons/SvgIcons/SvgIcons2';
import {Terminal_Icon, TextGeneration_Icon, Web_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';
import {Slider_Icon} from '../../../assets/icons/SvgIcons/SvgIcons4';
import {CloseSimple_Icon, GamePad_Icon, Rocket_Icon} from '../../../assets/icons/SvgIcons/SvgIcons5';
import {modalActions} from '../../Redux/Reducer/ModalsReducer';
import {tabsActions, useTabsState} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import {PageID} from '../../Utils/Constants';

type Props = {
  tab: TabInfo;
};

export default function TabItem({tab}: Props) {
  const activeTab = useTabsState('activeTab');
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (btnRef.current) {
      btnRef.current.addEventListener('auxclick', (e: MouseEvent) => {
        if (e.button === 1) {
          e.preventDefault();
          removeTab();
        }
      });
    }
  }, [btnRef, tab]);

  const removeTab = () => {
    dispatch(tabsActions.removeTab(tab.id));
    dispatch(modalActions.removeAllModalsForTabId({tabId: tab.id}));
  };

  const onPress = () => dispatch(tabsActions.setActiveTab(tab.id));

  const icon = useMemo(() => {
    if (tab.pageID === PageID.home) return <Home_Icon className="size-full" />;
    if (tab.pageID === PageID.imageGen) return <ImageGeneration_Icon className="size-full" />;
    if (tab.pageID === PageID.textGen) return <TextGeneration_Icon className="size-full" />;
    if (tab.pageID === PageID.audioGen) return <AudioGeneration_Icon className="size-full" />;

    if (tab.pageID === PageID.games) return <GamePad_Icon className="size-full" />;
    if (tab.pageID === PageID.tools) return <Rocket_Icon className="size-full" />;

    if (tab.pageID === PageID.dashboard) return <Info_Icon className="size-full" />;
    if (tab.pageID === PageID.modules) return <Extensions2_Icon className="size-full" />;
    if (tab.pageID === PageID.extensions) return <Extensions_Icon className="size-full" />;
    if (tab.pageID === PageID.settings) return <Slider_Icon className="size-full" />;

    return <Web_Icon className="size-full" />;
  }, [tab]);

  return (
    <Button
      className={
        'pr-0 text-small pl-2 flex rounded-t-lg data-[hover=true]:bg-foreground-100 flex-row cursor-default gap-x-0 ' +
        `${activeTab == tab.id && 'bg-white dark:bg-[#303033]'}`
      }
      ref={btnRef}
      radius="none"
      variant="light"
      onPress={onPress}>
      <div className="flex gap-x-1 flex-row items-center min-w-0 flex-1">
        {tab.isLoading ? (
          <Spinner size="sm" color="primary" />
        ) : tab.isTerminal ? (
          <Terminal_Icon className="opacity-80 shrink-0 text-secondary" />
        ) : (
          <div className="shrink-0 size-4 content-center">{icon}</div>
        )}
        <span className="truncate">{tab.title}</span>
      </div>

      <Button as="span" size="sm" variant="light" onPress={removeTab} className="scale-75 cursor-default" isIconOnly>
        <CloseSimple_Icon className="size-4" />
      </Button>
    </Button>
  );
}
