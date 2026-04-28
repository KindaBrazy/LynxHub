import {Card, Description, useOverlayState} from '@heroui-v3/react';
import {useAppState} from '@lynx/redux/reducers/app';
import {getAccentColorAsHex} from '@lynx/utils/accentColorGenerator';
import {extractGitUrl} from '@lynx_common/utils';
import {motion} from 'framer-motion';
import {CSSProperties, memo, useMemo, useState} from 'react';

const MotionCard = motion.create(Card);

import Footer from './Footer';
import {CardHeaderContent} from './Header';
import InstallCardModal from './menu/update/installModal';
import {useCardStore} from './store';
import {useCardActions} from './useCardActions';
import {useCardTitle} from './useCardTitle';

type AccentStyle = CSSProperties & {'--accent-bg-color'?: string};

/**
 * Main Card component for displaying a plugin/module.
 */
const LynxCard = memo(() => {
  const isInstalled = useCardStore(state => state.installed);
  const title = useCardStore(state => state.title);
  const repoUrl = useCardStore(state => state.repoUrl);
  const description = useCardStore(state => state.description);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  const installModal = useOverlayState();
  const [installModalType, setInstallModalType] = useState<'install' | 'update'>('install');

  const {startAi, install, isRunning, updating, updateAvailable, isUpdatingExtensions, updateCount} = useCardActions(
    installModal,
    setInstallModalType,
  );

  const {modifiedTitle, onTitleChange} = useCardTitle();

  const isDarkMode = useAppState('darkMode');

  // Calculate accent color based on developer name and title
  const {developer} = useMemo(() => {
    const {owner} = extractGitUrl(repoUrl);
    return {developer: owner};
  }, [repoUrl]);

  const accentColor = useMemo(() => getAccentColorAsHex(title, developer), [title, developer]);

  const accentStyle: AccentStyle = useMemo(
    () =>
      isInstalled
        ? {'--accent-bg-color': `${accentColor}${isDarkMode ? '25' : '15'}`} // Use 18% opacity for dark, 8% for light
        : {},
    [isInstalled, accentColor, isDarkMode],
  );

  const isPressable = !isRunning && !updating && !isUpdatingExtensions;

  return (
    <>
      <MotionCard
        onClick={() => {
          if (!isPressable) return;

          if (isInstalled) startAi();
          else install();
        }}
        className={
          'relative h-46 w-75 border border-surface transition-all duration-200 ' +
          `group hover:scale-[1.02] hover:shadow-lg ${isPressable && 'cursor-pointer'}`
        }
        whileHover="hover"
        onContextMenu={() => setMenuIsOpen(true)}>
        <div
          style={accentStyle}
          className={`absolute inset-0 z-0 scale-150 opacity-50 ${isInstalled ? 'bg-installed' : 'bg-uninstalled'}`}
        />

        <CardHeaderContent
          modifiedTitle={modifiedTitle}
          onTitleChange={onTitleChange}
          updateAvailable={updateAvailable}
        />

        <Card.Content>
          <Description className="line-clamp-3 text-xs">{description}</Description>
        </Card.Content>

        <Footer
          updating={updating}
          state={installModal}
          isRunning={isRunning}
          updateCount={updateCount}
          setType={setInstallModalType}
          id={useCardStore(state => state.id)}
          updatingExtensions={isUpdatingExtensions}
        />
      </MotionCard>

      <InstallCardModal state={installModal} type={installModalType} />
    </>
  );
});

export default LynxCard;
