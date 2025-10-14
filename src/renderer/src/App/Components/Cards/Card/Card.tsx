import {Card, CardBody, CardHeader, Chip, User} from '@heroui/react';
import {AnimatePresence, motion} from 'framer-motion';
import {CSSProperties, FormEvent, memo, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {getAccentColorAsHex} from '../../../../../../cross/AccentColorGenerator';
import {extractGitUrl} from '../../../../../../cross/CrossUtils';
import AddBreadcrumb_Renderer from '../../../../../Breadcrumbs';
import {DownloadDuo_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionRendererApi} from '../../../Extensions/ExtensionLoader';
import {getCardMethod, useAllCardMethods} from '../../../Modules/ModuleLoader';
import {useAppState} from '../../../Redux/Reducer/AppReducer';
import {cardsActions, useCardsState} from '../../../Redux/Reducer/CardsReducer';
import {modalActions} from '../../../Redux/Reducer/ModalsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {
  useInstalledCard,
  useIsAutoUpdateExtensions,
  useUpdateAvailable,
  useUpdatingCard,
} from '../../../Utils/UtilHooks';
import Footer from './Footer';
import PulsingLine from './PulsingLine';
import {useCardStore} from './Wrapper';

type AccentStyle = CSSProperties & {'--accent-bg-color'?: string};

const LynxCard = memo(() => {
  const dispatch = useDispatch<AppDispatch>();

  const allMethods = useAllCardMethods();

  const activeTab = useTabsState('activeTab');
  const runningCard = useCardsState('runningCard');
  const updatingExtensions = useCardsState('updatingExtensions');

  const id = useCardStore(state => state.id);
  const isInstalled = useCardStore(state => state.installed);
  const title = useCardStore(state => state.title);
  const type = useCardStore(state => state.type);
  const repoUrl = useCardStore(state => state.repoUrl);
  const description = useCardStore(state => state.description);
  const extensionsDir = useCardStore(state => state.extensionsDir);

  const card = useInstalledCard(id);
  const updating = useUpdatingCard(id);
  const updateAvailable = useUpdateAvailable(id);
  const autoUpdateExtensions = useIsAutoUpdateExtensions(id);

  const modifiedTitle = useMemo(() => {
    return window.localStorage.getItem(`${id}_title_edited`) || title;
  }, [id, title]);
  const {developer, avatarSrc} = useMemo(() => {
    const developer = extractGitUrl(repoUrl).owner;
    return {developer, avatarSrc: `https://github.com/${developer}.png`};
  }, [repoUrl]);
  const isRunning = useMemo(() => runningCard.some(item => item.id === id), [runningCard, id]);
  const accentColor = useMemo(() => getAccentColorAsHex(title, developer), [title, developer]);

  const isDarkMode = useAppState('darkMode');

  const accentStyle: AccentStyle = useMemo(
    () =>
      isInstalled
        ? {'--accent-bg-color': `${accentColor}${isDarkMode ? '25' : '15'}`} // Use 18% opacity for dark, 8% for light
        : {},
    [isInstalled, accentColor, isDarkMode],
  );

  const [isUpdatingExtensions, setIsUpdatingExtensions] = useState<boolean>(false);
  const [updateCount, setUpdateCount] = useState<string>('');

  useEffect(() => {
    if (updatingExtensions && updatingExtensions.id === id) {
      if (updatingExtensions.step === 'done') {
        setIsUpdatingExtensions(false);
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
      setIsUpdatingExtensions(true);
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

  const onTitleChange = useCallback(
    (e: FormEvent<HTMLSpanElement>) => {
      window.localStorage.setItem(`${id}_title_edited`, e.currentTarget.textContent || title);
    },
    [id],
  );

  return (
    <Card
      as={motion.div}
      whileHover="hover"
      onPress={isInstalled ? startAi : install}
      variants={{hover: {scale: 1.02}, initial: {scale: 1}}}
      isPressable={!isRunning && !updating && !isUpdatingExtensions}
      className="relative w-[300px] h-[210px] border border-foreground-100 px-2 group shadow-md">
      <div
        style={accentStyle}
        className={`absolute scale-150 opacity-50 inset-0 z-0 ${isInstalled ? 'bg-installed' : 'bg-uninstalled'}`}
      />
      <PulsingLine accentColor={accentColor} isInstalled={isInstalled} />

      <CardHeader className="justify-between">
        <User
          avatarProps={{
            src: avatarSrc,
            name: modifiedTitle,
            isBordered: true,
            showFallback: true,
          }}
          name={
            <span
              onBlur={() => {
                const selection = window.getSelection();
                if (selection) {
                  selection.removeAllRanges();
                }
              }}
              className={
                'cursor-text outline-none focus:border-2 border-transparent focus:border-foreground-200' +
                ' focus:px-1 rounded-lg transition duration-300'
              }
              onKeyDown={e => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              spellCheck="false"
              onInput={onTitleChange}
              onClick={e => e.stopPropagation()}
              contentEditable
              suppressContentEditableWarning>
              {modifiedTitle}
            </span>
          }
          description={`By ${developer}`}
          className="scale-120 mx-3 mt-2"
          classNames={{description: 'text-[0.7rem]'}}
        />
        <AnimatePresence>
          {updateAvailable && (
            <Chip
              size="sm"
              variant="flat"
              as={motion.div}
              color="success"
              key="chip_update"
              exit={{opacity: 0, translateY: 2}}
              className="flex flex-row gap-x-0.5"
              initial={{opacity: 0, translateY: 2}}
              animate={{opacity: 1, translateY: 0}}
              startContent={<DownloadDuo_Icon className="size-3" />}>
              Update
            </Chip>
          )}
        </AnimatePresence>
      </CardHeader>
      <CardBody className="py-2 justify-center">
        <span className=" line-clamp-3 text-foreground-500">{description}</span>
      </CardBody>
      <Footer
        id={id}
        updating={updating}
        isRunning={isRunning}
        updateCount={updateCount}
        updatingExtensions={isUpdatingExtensions}
      />
    </Card>
  );
});

export default LynxCard;
