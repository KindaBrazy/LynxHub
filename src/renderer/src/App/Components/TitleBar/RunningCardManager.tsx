import {Button} from '@heroui/react';
import {Divider, Typography} from 'antd';
import {isEmpty} from 'lodash';
import {useCallback, useMemo} from 'react';
import {isHotkeyPressed} from 'react-hotkeys-hook';
import {useDispatch} from 'react-redux';

import {Terminal_Icon, Web_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';
import {Refresh3_Icon} from '../../../assets/icons/SvgIcons/SvgIcons4';
import {cardsActions, useCardsState} from '../../Redux/Reducer/CardsReducer';
import {AppDispatch} from '../../Redux/Store';
import LynxTooltip from '../Reusable/LynxTooltip';
import SmallButton from '../Reusable/SmallButton';
import RCM_Terminate from './RCM_Terminate';
import WebviewZoomFactor from './Webview-ZoomFactor';

const RunningCardManager = () => {
  const runningCard = useCardsState('runningCard');
  const dispatch = useDispatch<AppDispatch>();

  const changeAiView = useCallback(() => {
    if (runningCard.id) {
      dispatch(cardsActions.setRunningCardView(runningCard.currentView === 'terminal' ? 'browser' : 'terminal'));
    }
  }, [runningCard.id, runningCard.currentView, dispatch]);

  const refresh = useCallback(() => {
    const iframe = document.getElementById(runningCard.browserId) as HTMLIFrameElement;
    if (iframe) {
      iframe.src = runningCard.address;
    }
  }, [runningCard.browserId, runningCard.address]);

  const copyToClipboard = useCallback(() => {
    if (isHotkeyPressed('control')) {
      window.open(runningCard.address);
    } else {
      navigator.clipboard.writeText(runningCard.address);
    }
  }, [runningCard.address]);

  const isBrowserView = useMemo(() => {
    return runningCard.currentView === 'browser';
  }, [runningCard.currentView]);

  return (
    <div className="flex flex-row items-center justify-center">
      <LynxTooltip content="Terminate Process" isEssential>
        <RCM_Terminate />
      </LynxTooltip>

      {!isEmpty(runningCard.address) && (
        <>
          <Divider type="vertical" className="mr-0" />
          <LynxTooltip content={`Switch to ${isBrowserView ? 'Terminal' : 'Browser View'}`} isEssential>
            <div>
              <SmallButton
                icon={
                  isBrowserView ? (
                    <Terminal_Icon className={isBrowserView ? 'm-[8px]' : 'm-[7px]'} />
                  ) : (
                    <Web_Icon className={isBrowserView ? 'm-[8px]' : 'm-[7px]'} />
                  )
                }
                onClick={changeAiView}
              />
            </div>
          </LynxTooltip>
        </>
      )}
      {isBrowserView && (
        <>
          <Divider type="vertical" className="mr-4" />
          <LynxTooltip
            content={
              <div className="flex flex-col content-center items-center space-y-1 py-1">
                <span>Copy to Clipboard</span>
                <div className="space-x-1">
                  <Typography.Text keyboard>CTRL + Click</Typography.Text>
                  <span>Open in Browser</span>
                </div>
              </div>
            }
            delay={500}
            isEssential>
            <div>
              <Button
                size="sm"
                variant="light"
                onPress={copyToClipboard}
                className="notDraggable animate-appearance-in font-JetBrainsMono text-[0.8rem]">
                {runningCard.address}
              </Button>
            </div>
          </LynxTooltip>
        </>
      )}
      {!isEmpty(runningCard.address) && isBrowserView && (
        <>
          <Divider type="vertical" className="ml-4 mr-0" />
          <LynxTooltip content="Refresh Browser View" isEssential>
            <div>
              <SmallButton onClick={refresh} icon={<Refresh3_Icon className="m-[8px]" />} />
            </div>
          </LynxTooltip>

          <Divider type="vertical" className="ml-4 mr-0" />
          <WebviewZoomFactor />
        </>
      )}
    </div>
  );
};

export default RunningCardManager;
