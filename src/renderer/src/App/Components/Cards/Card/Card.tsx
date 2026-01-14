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
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {
  useInstalledCard,
  useIsAutoUpdateExtensions,
  useUpdateAvailable,
  useUpdatingCard,
} from '../../../Utils/UtilHooks';
import {useTabModalManager} from '../../Modals/useTabModalManager';
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
  const repoUrl = useCardStore(state => state.repoUrl);
  const description = useCardStore(state => state.description);
  const extensionsDir = useCardStore(state => state.extensionsDir);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  const card = useInstalledCard(id);
  const updating = useUpdatingCard(id);
  const updateAvailable = useUpdateAvailable(id);
  const autoUpdateExtensions = useIsAutoUpdateExtensions(id);

  const [customTitle, setCustomTitle] = useState<string | null>(null);

  const {openModal} = useTabModalManager();

  useEffect(() => {
    let isMounted = true;
    rendererIpc.storage.getCustom(`${id}_title_edited`).then(value => {
      if (isMounted) setCustomTitle(value || null);
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const modifiedTitle = customTitle ?? title;

  const {developer, avatarSrc} = useMemo(() => {
    const {owner, avatarUrl} = extractGitUrl(repoUrl);
    // Use image cache for remote avatar URLs
    const cachedAvatarUrl = avatarUrl ? `lynxcache://fetch/${encodeURIComponent(avatarUrl)}` : avatarUrl;
    return {developer: owner, avatarSrc: cachedAvatarUrl};
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
      rendererIpc.pty.process(id, id);
      rendererIpc.storageUtils.recentlyUsedCards('update', id);
      dispatch(cardsActions.addRunningCard({tabId: activeTab, id}));
    }
  }, [id, autoUpdateExtensions, activeTab, dispatch]);

  const install = useCallback(() => {
    AddBreadcrumb_Renderer(`Start Installing AI: id:${id}`);
    if (getCardMethod(allMethods, id, 'manager')) {
      extensionRendererApi.events.emit('before_card_install', {id});
      openModal('installUI', {cardId: id, type: 'install', title}, 'active');
    }
  }, [repoUrl, title, id, allMethods, openModal]);

  const onTitleChange = useCallback(
    (e: FormEvent<HTMLSpanElement>) => {
      const newTitle = e.currentTarget.textContent || title;
      setCustomTitle(newTitle);
      rendererIpc.storage.setCustom(`${id}_title_edited`, newTitle);
    },
    [id, title],
  );

  return (
    <Card
      className={
        'relative w-[300px] h-[210px] border border-foreground-100 px-2 group ' +
        'hover:scale-[1.02] shadow-md transition-all hover:shadow-lg duration-300'
      }
      as={motion.div}
      whileHover="hover"
      onContextMenu={() => setMenuIsOpen(true)}
      onPress={isInstalled ? startAi : install}
      isPressable={!isRunning && !updating && !isUpdatingExtensions}>
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
        <span className=" line-clamp-3 text-foreground-500 text-sm">{description}</span>
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
