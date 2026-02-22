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
          className: 'shrink-0',
          showFallback: true,
          classNames: {base: isInstalled && 'ring-primary-200'},
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
              ' focus:px-1 rounded-lg transition duration-300 line-clamp-1'
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
