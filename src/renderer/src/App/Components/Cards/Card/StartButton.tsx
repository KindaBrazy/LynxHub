import {Button} from '@heroui/react';
import {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Download2_Icon, Play_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {getCardMethod, useAllCards} from '../../../Modules/ModuleLoader';
import {cardsActions, useCardsState} from '../../../Redux/Reducer/CardsReducer';
import {modalActions} from '../../../Redux/Reducer/ModalsReducer';
import {useSettingsState} from '../../../Redux/Reducer/SettingsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {useInstalledCard, useIsAutoUpdateExtensions, useUpdatingCard} from '../../../Utils/UtilHooks';
import ShinyText from '../../Reusable/ShinyText';
import {useCardData} from '../CardsDataManager';

const StartButton = memo(() => {
  const {id, installed, repoUrl, title, type, extensionsDir} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');
  const autoUpdateExtensions = useIsAutoUpdateExtensions(id);
  const allCards = useAllCards();
  const activeTab = useTabsState('activeTab');

  const updatingExtensions = useCardsState('updatingExtensions');

  const card = useInstalledCard(id);

  const [isUpdatingExt, setIsUpdatingExt] = useState<boolean>(false);
  const [updateCount, setUpdateCount] = useState<string>('');

  const updating = useUpdatingCard(id);

  const runningCard = useCardsState('runningCard');
  const isRunning = useMemo(() => runningCard.some(item => item.id === id), [runningCard, id]);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (updatingExtensions && updatingExtensions.id === id) {
      if (updatingExtensions.step === 'done') {
        setIsUpdatingExt(false);
        rendererIpc.win.setDiscordRpAiRunning({running: true, name: title, type});
      } else {
        setUpdateCount(updatingExtensions.step);
      }
    }
  }, [updatingExtensions]);

  const startAi = useCallback(() => {
    if (autoUpdateExtensions && card) {
      rendererIpc.utils.updateAllExtensions({id, dir: card.dir! + extensionsDir!});
      setIsUpdatingExt(true);
    } else {
      rendererIpc.pty.process(id, 'start', id);
      rendererIpc.storageUtils.recentlyUsedCards('update', id);
      rendererIpc.win.setDiscordRpAiRunning({running: true, name: title, type});
      dispatch(cardsActions.addRunningCard({tabId: activeTab, id}));
    }
  }, [id, autoUpdateExtensions, activeTab, dispatch]);

  const install = useCallback(() => {
    if (getCardMethod(allCards, id, 'manager')) {
      dispatch(modalActions.openInstallUICard({cardId: id, tabID: activeTab, type: 'install', title}));
    }
  }, [repoUrl, title, id, dispatch, allCards, activeTab]);

  return (
    <Button
      startContent={
        isUpdatingExt ? (
          <span className="text-xs text-white">Updating Extensions {updateCount}</span>
        ) : updating ? (
          <span className="text-xs text-white">Updating...</span>
        ) : installed ? (
          isRunning ? (
            <ShinyText speed={2} text="Running..." className="font-bold" />
          ) : (
            <Play_Icon className={compactMode ? `size-4` : 'size-5'} />
          )
        ) : (
          <Download2_Icon className={compactMode ? 'size-5' : 'size-5'} />
        )
      }
      size={compactMode ? 'sm' : 'md'}
      onPress={installed ? startAi : install}
      isDisabled={!!updating || isUpdatingExt || isRunning}
      color={installed ? (isRunning ? 'secondary' : 'primary') : 'default'}
      className={`z-[11] hover:scale-[1.03] ${!installed && 'bg-foreground-200 dark:bg-foreground-100'}`}
      fullWidth
    />
  );
});
export default StartButton;
