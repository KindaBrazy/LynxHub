import {Avatar, CardHeader, Chip, Description, Label, Spinner} from '@heroui-v3/react';
import {extractGitUrl, getCacheUrl} from '@lynx_common/utils';
import {DownloadMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {AnimatePresence, motion} from 'framer-motion';
import {memo, useMemo} from 'react';

import {useCardsState} from '../../redux/reducers/cards';
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

  return (
    <CardHeader className="justify-between flex-row">
      <div className="inline-flex items-center gap-2">
        <Avatar className={`size-12 shrink-0 ${isInstalled && 'ring-LynxBlue ring-2'}`}>
          <Avatar.Image src={avatarSrc} alt={modifiedTitle} />
          <Avatar.Fallback>{...modifiedTitle.split(' ').map(item => item.slice(0, 1).toUpperCase())}</Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col">
          <Label
            className={
              'cursor-text outline-none focus:border border-transparent focus:border-surface-secondary' +
              ' focus:px-1.5 focus:py-0.5 rounded-lg transition duration-200 line-clamp-1 z-20'
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
          </Label>
          <Description>By {developer}</Description>
        </div>
      </div>

      <AnimatePresence>
        {isInstalled && updateAvailable && (
          <motion.div
            exit={{opacity: 0, translateY: 2}}
            animate={{opacity: 1, translateY: 0}}
            initial={{opacity: 0, translateY: 2}}>
            <Chip size="sm" variant="soft" color="success" className="px-2" key="chip_update">
              <DownloadMinimalistic />
              Update
            </Chip>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInstalled && updateChecking === id && (
          <motion.div
            exit={{opacity: 0, translateY: 2}}
            animate={{opacity: 1, translateY: 0}}
            initial={{opacity: 0, translateY: 2}}>
            <Spinner size="sm" color="success" className="absolute top-1.5 right-1.5" />
          </motion.div>
        )}
      </AnimatePresence>
    </CardHeader>
  );
});
