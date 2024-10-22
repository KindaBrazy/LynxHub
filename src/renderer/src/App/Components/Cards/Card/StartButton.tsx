import {Button} from '@nextui-org/react';
import {memo, useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extractGitUrl} from '../../../../../../cross/CrossUtils';
import {getIconByName} from '../../../../assets/icons/SvgIconsContainer';
import {useModules} from '../../../Modules/ModulesContext';
import {cardsActions, useCardsState} from '../../../Redux/AI/CardsReducer';
import {modalActions} from '../../../Redux/AI/ModalsReducer';
import {useSettingsState} from '../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {useInstalledCard, useIsAutoUpdateExtensions, useUpdatingCard} from '../../../Utils/UtilHooks';
import {useCardData} from '../CardsDataManager';

const StartButton = memo(() => {
  const {id, installed, repoUrl, title, type, extensionsDir} = useCardData();
  const {getMethod} = useModules();
  const compactMode = useSettingsState('cardsCompactMode');
  const autoUpdateExtensions = useIsAutoUpdateExtensions(id);

  const updatingExtensions = useCardsState('updatingExtensions');

  const card = useInstalledCard(id);

  const [isUpdatingExt, setIsUpdatingExt] = useState<boolean>(false);
  const [updateCount, setUpdateCount] = useState<string>('');

  const updating = useUpdatingCard(id);

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
      rendererIpc.utils.updateAllExtensions({id, dir: card.dir + extensionsDir});
      setIsUpdatingExt(true);
    } else {
      rendererIpc.pty.process('start', id);
      rendererIpc.storageUtils.recentlyUsedCards('update', id);
      rendererIpc.win.setDiscordRpAiRunning({running: true, name: title, type});
      dispatch(cardsActions.startRunningCard(id));
    }
  }, [id, autoUpdateExtensions, dispatch]);

  const install = useCallback(() => {
    if (getMethod(id, 'manager')) {
      dispatch(modalActions.openInstallUICard({id, type: 'install', title}));
    } else {
      rendererIpc.file.getAppDirectories('AIWorkspaces').then(dir => {
        const isWin = window.osPlatform === 'win32';
        const directory = `${dir}${isWin ? '\\' : '/'}${extractGitUrl(repoUrl).repo}`;

        dispatch(
          modalActions.openInstallCard({
            cardId: id,
            title,
            directory,
            url: repoUrl,
          }),
        );
      });
    }
  }, [repoUrl, title, id, getMethod, dispatch]);

  return (
    <Button
      startContent={
        isUpdatingExt ? (
          <span className="text-xs text-white">Updating Extensions {updateCount}</span>
        ) : updating ? (
          <span className="text-xs text-white">Updating...</span>
        ) : (
          getIconByName(installed ? 'Play' : 'Download2', {
            className: compactMode
              ? installed
                ? `size-4 text-white`
                : 'size-5 text-white'
              : installed
                ? 'size-5 text-white'
                : 'size-6 text-white',
          })
        )
      }
      variant="solid"
      size={compactMode ? 'sm' : 'md'}
      className="z-[11] hover:scale-[1.03]"
      onPress={installed ? startAi : install}
      isDisabled={!!updating || isUpdatingExt}
      color={installed ? 'primary' : 'secondary'}
    />
  );
});
export default StartButton;
