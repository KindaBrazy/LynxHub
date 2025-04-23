import {Avatar, Button, Checkbox, Popover, PopoverContent, PopoverTrigger, Spinner, Tooltip} from '@heroui/react';
import {Typography} from 'antd';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {isHotkeyPressed} from 'react-hotkeys-hook';
import {useDispatch} from 'react-redux';

import {TabInfo} from '../../../../../cross/CrossTypes';
import {getFavIconUrl} from '../../../../../cross/CrossUtils';
import {AudioGeneration_Icon, Extensions_Icon, Extensions2_Icon} from '../../../assets/icons/SvgIcons/SvgIcons1';
import {Home_Icon, ImageGeneration_Icon, Info_Icon} from '../../../assets/icons/SvgIcons/SvgIcons2';
import {Terminal_Icon, TextGeneration_Icon, Web_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';
import {Slider_Icon} from '../../../assets/icons/SvgIcons/SvgIcons4';
import {CloseSimple_Icon, GamePad_Icon, Rocket_Icon} from '../../../assets/icons/SvgIcons/SvgIcons5';
import {cardsActions, useCardsState} from '../../Redux/Reducer/CardsReducer';
import {modalActions} from '../../Redux/Reducer/ModalsReducer';
import {settingsActions, useSettingsState} from '../../Redux/Reducer/SettingsReducer';
import {tabsActions, useTabsState} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import {PageID} from '../../Utils/Constants';
import TabTitle from './TabTitle';

type Props = {
  tab: TabInfo;
};

export default function TabItem({tab}: Props) {
  const activeTab = useTabsState('activeTab');
  const runningCards = useCardsState('runningCard');
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const closeTabConfirm = useSettingsState('closeTabConfirm');

  const onShowConfirm = useCallback(
    (enabled: boolean) => {
      rendererIpc.storage.update('app', {terminateAIConfirm: !enabled});
      dispatch(settingsActions.setSettingsState({key: 'terminateAIConfirm', value: !enabled}));
    },
    [dispatch],
  );

  const removeTab = () => {
    const running = runningCards.find(card => card.tabId === tab.id);
    if (running && running.type !== 'browser') {
      rendererIpc.pty.process(running.id, 'stop', running.id);
      rendererIpc.pty.customProcess(running.id, 'stop', running.id);
      rendererIpc.pty.emptyProcess(running.id, 'stop', running.id);
    }

    dispatch(tabsActions.removeTab(tab.id));
    dispatch(modalActions.removeAllModalsForTabId({tabId: tab.id}));
    dispatch(cardsActions.stopRunningCard({tabId: tab.id}));
    setIsConfirmOpen(false);
  };

  const handleRemove = () => {
    const running = runningCards.find(card => card.tabId === tab.id);
    if (running) {
      if (running.type === 'browser') {
        removeTab();
      } else {
        if (isHotkeyPressed('control') || !closeTabConfirm) {
          removeTab();
        } else if (!isConfirmOpen) {
          setIsConfirmOpen(true);
        }
      }
    } else {
      removeTab();
    }
  };
  const handleEvent = (e: MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      handleRemove();
    }
  };

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

  const icon = useMemo(() => {
    if (tab.favIcon.show) {
      return <Avatar name={tab.title} className="size-full" src={getFavIconUrl(tab.favIcon.targetUrl)} />;
    }

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

  const [isTruncated, setIsTruncated] = useState<boolean>(false);

  return (
    <>
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
            'pr-0 text-small pl-2 flex rounded-t-lg data-[hover=true]:bg-foreground-100 flex-row ' +
            `cursor-default gap-x-0 ${activeTab == tab.id && 'bg-white dark:bg-[#303033]'}`
          }
          ref={btnRef}
          radius="none"
          variant="light"
          onPress={onPress}>
          <div className="flex gap-x-1 flex-row items-center min-w-0 flex-1">
            {tab.isLoading ? (
              <Spinner size="sm" color="primary" variant="simple" className="scale-80 mb-0.5" />
            ) : tab.isTerminal ? (
              <Terminal_Icon className="opacity-80 shrink-0 text-secondary mb-0.5" />
            ) : (
              <div className="shrink-0 size-4 content-center mb-0.5">{icon}</div>
            )}
            <TabTitle title={tab.title} setIsTruncated={setIsTruncated} />
          </div>

          <Button
            as="span"
            size="sm"
            variant="light"
            onPress={handleRemove}
            className="scale-75 cursor-default"
            isIconOnly>
            <CloseSimple_Icon className="size-4" />
          </Button>
        </Button>
      </Tooltip>

      <Popover
        onClick={e => {
          // @ts-expect-error
          if (e.target.dataset.slot === 'backdrop') {
            setIsConfirmOpen(false);
          }
        }}
        offset={25}
        crossOffset={-70}
        backdrop="opaque"
        isOpen={isConfirmOpen}
        placement="bottom-start"
        onOpenChange={setIsConfirmOpen}
        classNames={{base: 'before:dark:bg-LynxRaisinBlack', backdrop: '!top-10'}}
        showArrow>
        <PopoverTrigger>
          <div />
        </PopoverTrigger>
        <PopoverContent className="py-4 px-8 dark:bg-LynxRaisinBlack">
          <span className="self-start text-medium font-semibold">Close Terminal Tab?</span>

          <div className="mt-2 flex flex-col space-y-1">
            <Typography.Text>
              This will close the terminal tab and terminate running processes.
              <br />
              Proceed?
            </Typography.Text>

            <Checkbox size="sm" onValueChange={onShowConfirm}>
              Always close terminal tabs without confirmation
            </Checkbox>
          </div>

          <div className="mt-2 flex w-full flex-row justify-between">
            <Button
              onPress={() => {
                setIsConfirmOpen(false);
              }}
              size="sm">
              Cancel
            </Button>
            <div className="space-x-2">
              <Button size="sm" color="danger" onPress={removeTab}>
                Close Tab
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
