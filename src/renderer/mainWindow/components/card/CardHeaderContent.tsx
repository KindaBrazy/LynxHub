import {Button, CardHeader, Chip, Spinner, User} from '@heroui/react';
import {extractGitUrl, getCacheUrl} from '@lynx_common/utils';
import filesIpc from '@lynx_shared/ipc/files';
import {DownloadMinimalistic, FolderOpen} from '@solar-icons/react-perf/BoldDuotone';
import {AnimatePresence, motion} from 'framer-motion';
import {memo, useMemo} from 'react';

import {useCardsState} from '../../redux/reducers/cards';
import {useHotkeysState} from '../../redux/reducers/hotkeys';
import {useInstalledCard} from '../../utils/hooks';
import {useCardStore} from './store';

type CardHeaderContentProps = {
  /** The currently displayed title (could be custom). */
  modifiedTitle: string;
  /** Callback when the title is edited. */
  onTitleChange: (target: string) => void;
  /** Whether an update is available for this card. */
  updateAvailable: boolean;
};

/**
 * Component to display the header of the card, including user info and update status.
 */
export const CardHeaderContent = memo(({modifiedTitle, onTitleChange, updateAvailable}: CardHeaderContentProps) => {
  const updateChecking = useCardsState('updateChecking');
  const repoUrl = useCardStore(state => state.repoUrl);
  const isInstalled = useCardStore(state => state.installed);
  const id = useCardStore(state => state.id);

  const {developer, avatarSrc} = useMemo(() => {
    const {owner, avatarUrl} = extractGitUrl(repoUrl);
    return {developer: owner, avatarSrc: getCacheUrl(avatarUrl)};
  }, [repoUrl]);

  const isCtrlPressed = useHotkeysState('isCtrlPressed');
  const webUI = useInstalledCard(id);

  const showOpenFolder = useMemo(() => {
    return !!webUI?.dir && isCtrlPressed;
  }, [webUI, isCtrlPressed]);

  const openFolder = () => {
    if (webUI && webUI.dir) filesIpc.openPath(webUI.dir);
  };

  return (
    <CardHeader key={`${id}_ttt`} className="justify-between">
      <User
        avatarProps={{
          src: avatarSrc,
          name: modifiedTitle,
          isBordered: true,
          className: 'shrink-0',
          showFallback: true,
          classNames: {base: isInstalled && 'ring-primary-200'},
        }}
        name={
          <span
            className={
              'cursor-text outline-none focus:border border-transparent focus:border-foreground-200' +
              ' focus:px-1.5 focus:py-0.5 rounded-lg transition duration-200 line-clamp-1'
            }
            onBlur={e => {
              const selection = window.getSelection();
              if (selection) {
                selection.removeAllRanges();
              }
              onTitleChange(e.currentTarget.textContent);
            }}
            onKeyDown={e => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                e.currentTarget.blur();
                // Reset title to original name
                onTitleChange('');
              }
            }}
            spellCheck="false"
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
        {isInstalled && updateAvailable && (
          <Chip
            size="sm"
            variant="flat"
            as={motion.div}
            color="success"
            key="chip_update"
            exit={{opacity: 0, translateY: 2}}
            className="flex flex-row gap-x-0.5"
            animate={{opacity: 1, translateY: 0}}
            initial={{opacity: 0, translateY: 2}}
            startContent={<DownloadMinimalistic className="size-3" />}>
            Update
          </Chip>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInstalled && updateChecking === id && (
          <Spinner
            size="sm"
            variant="dots"
            as={motion.div}
            color="success"
            className="absolute top-1 right-3"
            exit={{opacity: 0, translateY: 2}}
            animate={{opacity: 1, translateY: 0}}
            initial={{opacity: 0, translateY: 2}}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOpenFolder && (
          <Button
            as={motion.div}
            variant="light"
            onPress={openFolder}
            // @ts-ignore-next-line
            transition={{type: 'spring', duration: 0.5}}
            exit={{opacity: 0, scale: 0.8, translateY: 10}}
            animate={{opacity: 1, scale: 1, translateY: 0}}
            initial={{opacity: 0, scale: 0.8, translateY: 10}}
            className="absolute bottom-2 right-1/2 translate-x-1/2"
            isIconOnly
            disableAnimation>
            <FolderOpen size={16} className="text-foreground-600" />
          </Button>
        )}
      </AnimatePresence>
    </CardHeader>
  );
});
