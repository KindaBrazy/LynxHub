import {Button} from '@heroui/react';
import {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import AddBreadcrumb_Renderer from '../../../../../Breadcrumbs';
import {Download2_Icon, Play_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionRendererApi} from '../../../Extensions/ExtensionLoader';
import {getCardMethod, useAllCardMethods} from '../../../Modules/ModuleLoader';
import {useAppState} from '../../../Redux/Reducer/AppReducer';
import {cardsActions, useCardsState} from '../../../Redux/Reducer/CardsReducer';
import {modalActions} from '../../../Redux/Reducer/ModalsReducer';
import {useSettingsState} from '../../../Redux/Reducer/SettingsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {useInstalledCard, useIsAutoUpdateExtensions, useUpdatingCard} from '../../../Utils/UtilHooks';
import ShinyText from '../../Reusable/ShinyText';
import {useCardStore} from './Wrapper';

const StartButton = memo(() => {
  const dispatch = useDispatch<AppDispatch>();

  const darkMode = useAppState('darkMode');

  const id = useCardStore(state => state.id);
  const installed = useCardStore(state => state.installed);
  const repoUrl = useCardStore(state => state.repoUrl);
  const title = useCardStore(state => state.title);
  const type = useCardStore(state => state.type);
  const extensionsDir = useCardStore(state => state.extensionsDir);

  const compactMode = useSettingsState('cardsCompactMode');
  const autoUpdateExtensions = useIsAutoUpdateExtensions(id);
  const allMethods = useAllCardMethods();
  const activeTab = useTabsState('activeTab');

  const updatingExtensions = useCardsState('updatingExtensions');

  const card = useInstalledCard(id);

  const [isUpdatingExt, setIsUpdatingExt] = useState<boolean>(false);
  const [updateCount, setUpdateCount] = useState<string>('');

  const updating = useUpdatingCard(id);

  const runningCard = useCardsState('runningCard');
  const isRunning = useMemo(() => runningCard.some(item => item.id === id), [runningCard, id]);

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
    AddBreadcrumb_Renderer(`Starting AI: id:${id}`);
    extensionRendererApi.events.emit('before_card_start', {id});
    if (autoUpdateExtensions && card) {
      AddBreadcrumb_Renderer(`Updating AI Extensions: id:${id}`);
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
    AddBreadcrumb_Renderer(`Start Installing AI: id:${id}`);
    if (getCardMethod(allMethods, id, 'manager')) {
      extensionRendererApi.events.emit('before_card_install', {id});
      dispatch(modalActions.openInstallUICard({cardId: id, tabID: activeTab, type: 'install', title}));
    }
  }, [repoUrl, title, id, dispatch, allMethods, activeTab]);

  return (
    <Button
      startContent={
        isUpdatingExt ? (
          <span className="text-xs text-white">Updating Extensions {updateCount}</span>
        ) : updating ? (
          <span className="text-xs text-white">Updating...</span>
        ) : installed ? (
          isRunning ? (
            <ShinyText speed={2} text="Running..." darkMode={darkMode} className="font-bold" />
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
