import {Button, ButtonGroup, CardFooter} from '@nextui-org/react';
import {observer} from 'mobx-react-lite';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {extractGitHubUrl} from '../../../../../../cross/CrossUtils';
import {getIconByName} from '../../../../assets/icons/SvgIconsContainer';
import {cardsActions} from '../../../Redux/AI/CardsReducer';
import {modalActions} from '../../../Redux/AI/ModalsReducer';
import {useSettingsState} from '../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {useUpdatingCard} from '../../../Utils/UtilHooks';
import {useCardData} from '../CardsDataManager';
import CardMenu from './Menu/CardMenu';

const LynxCardFooter = observer(() => {
  const {id, installed, repoUrl, title, type} = useCardData();
  const compactMode = useSettingsState('cardsCompactMode');
  const updating = useUpdatingCard(id);

  const dispatch = useDispatch<AppDispatch>();

  const startAi = useCallback(() => {
    rendererIpc.pty.process('start', id);
    rendererIpc.storageUtils.recentlyUsedCards('update', id);
    rendererIpc.win.setDiscordRpAiRunning({running: true, name: title, type});
    dispatch(cardsActions.startRunningCard(id));
  }, [id, title, type, dispatch]);

  const install = useCallback(() => {
    rendererIpc.file.getAppDirectories('AIWorkspaces').then(dir => {
      const directory = `${dir}\\${extractGitHubUrl(repoUrl).repo}`;

      dispatch(
        modalActions.openInstallCard({
          cardId: id,
          title,
          directory,
          url: repoUrl,
        }),
      );
    });
  }, [repoUrl, title, id, dispatch]);

  const openDoc = useCallback(() => {
    window.open(repoUrl);
  }, [repoUrl]);

  return (
    <CardFooter>
      <ButtonGroup className="mb-1" fullWidth>
        <Button
          startContent={
            updating ? (
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
          isDisabled={!!updating}
          size={compactMode ? 'sm' : 'md'}
          className="z-[11] hover:scale-[1.03]"
          onPress={installed ? startAi : install}
          color={installed ? 'primary' : 'secondary'}
        />
        {installed ? (
          <CardMenu />
        ) : (
          <Button
            onPress={openDoc}
            className="cursor-default"
            size={compactMode ? 'sm' : 'md'}
            startContent={getIconByName('Document', {className: `size-full ${compactMode ? 'm-2' : 'm-2.5'}`})}
            isIconOnly
          />
        )}
      </ButtonGroup>
    </CardFooter>
  );
});
export default LynxCardFooter;
