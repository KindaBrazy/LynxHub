import {CardHeader, Chip, User} from '@heroui/react';
import {extractGitUrl, getCacheUrl} from '@lynx_common/utils';
import {DownloadMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {AnimatePresence, motion} from 'framer-motion';
import {FormEvent, useMemo} from 'react';

import {useCardStore} from './store';

type CardHeaderContentProps = {
  /** The currently displayed title (could be custom). */
  modifiedTitle: string;
  /** Callback when the title is edited. */
  onTitleChange: (e: FormEvent<HTMLSpanElement>) => void;
  /** Whether an update is available for this card. */
  updateAvailable: boolean;
};

/**
 * Component to display the header of the card, including user info and update status.
 */
export function CardHeaderContent({modifiedTitle, onTitleChange, updateAvailable}: CardHeaderContentProps) {
  const repoUrl = useCardStore(state => state.repoUrl);
  const isInstalled = useCardStore(state => state.installed);

  const {developer, avatarSrc} = useMemo(() => {
    const {owner, avatarUrl} = extractGitUrl(repoUrl);
    return {developer: owner, avatarSrc: getCacheUrl(avatarUrl)};
  }, [repoUrl]);

  return (
    <CardHeader className="justify-between">
      <User
        avatarProps={{
          src: avatarSrc,
          name: modifiedTitle,
          isBordered: true,
          showFallback: true,
          classNames: {base: isInstalled && 'ring-primary-200'},
        }}
        className="mx-3 mt-2 scale-120"
        classNames={{description: 'text-[0.7rem]'}}
        description={`By ${developer}`}
        name={
          <span
            className={
              'cursor-text rounded-lg border-2 border-transparent px-1 outline-none transition duration-300 ' +
              'focus:border-foreground-200'
            }
            contentEditable
            spellCheck="false"
            suppressContentEditableWarning
            onBlur={() => {
              const selection = window.getSelection();
              if (selection) {
                selection.removeAllRanges();
              }
            }}
            onClick={e => e.stopPropagation()}
            onInput={onTitleChange}
            onKeyDown={e => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}>
            {modifiedTitle}
          </span>
        }
      />
      <AnimatePresence>
        {updateAvailable && (
          <Chip
            key="chip_update"
            animate={{opacity: 1, translateY: 0}}
            as={motion.div}
            className="flex flex-row gap-x-0.5"
            color="success"
            exit={{opacity: 0, translateY: 2}}
            initial={{opacity: 0, translateY: 2}}
            size="sm"
            startContent={<DownloadMinimalistic className="size-3" />}
            variant="flat">
            Update
          </Chip>
        )}
      </AnimatePresence>
    </CardHeader>
  );
}
