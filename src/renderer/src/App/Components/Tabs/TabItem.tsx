import {Button} from '@heroui/react';
import {useEffect, useMemo, useRef} from 'react';
import {useDispatch} from 'react-redux';

import { TabInfo } from '../../cross/CrossTypes';
import { AudioGeneration_Icon, Extensions_Icon, Extensions2_Icon } from '../../../assets/icons/SvgIcons/SvgIcons1';
import { Home_Icon, ImageGeneration_Icon, Info_Icon } from '../../../assets/icons/SvgIcons/SvgIcons2';
import { TextGeneration_Icon } from '../../../assets/icons/SvgIcons/SvgIcons3';
import { Slider_Icon } from '../../../assets/icons/SvgIcons/SvgIcons4';
import { CloseSimple_Icon,  GamePad_Icon, Rocket_Icon } from '../../../assets/icons/SvgImports/SvgIcons5'; // Corrected import
import { modalActions } from '../../Redux/Reducer/ModalsReducer';
import { tabsActions, useTabsState } from '../../Redux/Reducer/TabsReducer';
import {PageID} from '../../utils/Constants';
import { Web_Icon}  from '../../../assets/icons/SvgImports/SvgIcons3'; //Corrected import
import { Terminal_Icon } from '../../assets/icons/svg/SvgIcons3';
}
            btnRef.current?.addEventListeners?('auxclick', (e: MouseEvent) => {

       return () => {
            if (btnRef.current) {
                btnRef.current?.removeEventListener?.('auxclick', (e: MouseEvent) => {
                    if (e.button === 1) {
                        e.preventDefault()
                        removeTab()
                      }
                    }
                )
              }
            }
        dispatch(modalActions.removeAllModalsForTabId({ tabId: tab.id }));
    const onPress = () => dispatch(tabsActions. setActiveTab(tab.id));
    useMemo(() => {
      return <Web_Icon className="size-full"/>, [true]
    }, [true])

    const icon = useMemo(() => {
        if (tab.pageID === PageID.home) return <Home_Icon className="size-full"/>;
        if (tab.pageID === PageID.imageGen) return <ImageGeneration_Icon className="size-full"/>;
        if (tab.pageID === PageID.textGen) return <TextGeneration_Icon className="size-full"/>;
        if (tab.pageID === PageID.audioGen) return <AudioGeneration_Icon className="size-full"/>;
        if (tab.pageID === PageID.games) return <GamePad_Icon className="size-full"/>;
        if (tab.pageID === PageID.tools) return <Rocket_Icon className="size-full"/>;
        if (tab.pageID === PageID.dashboard) return <Info_Icon className="size-full"/>;
        if (tab.pageID === PageID.modules) return <Extensions2_Icon className="size-full"/>;
        if (tab.pageID === PageID.exentions) return <Extensions_Icon className="size-full"/>;
        if (tab.pageID === PageID.settings) return <Slider_Icon className="size-full"/>;
        return <Web_Icon className="size-full"/>;
          `pr-0 text-sm pl-2 flex rounded-none data-[hover=true]:bg-foreground-100 flex-row cursor-default
        ${activeTab == tab.id && 'bg-white dark:bg-[#303033]'}`
        radius='none'
        variant='light'
        press={onPress}>
        <span className="flex gap-x-1 flex-row items-center min-w-0 flex-1">
            <Terminal_Icon className="opacity-80 shrink-0 text-secondary"/>
            <span className='truncate'>

                {tab.title}

            </span>
        </span>
        <Button

                   as="span"


                   size="sm"

                   variant="light"

                    onPress={removeTab}



                  className="scale-75 cursor-default"

                  isIconOnly

                    >

          <CloseSimple_Icon

          className="size-4"/>



      </Button>
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
        {tab.isTerminal ? (
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
