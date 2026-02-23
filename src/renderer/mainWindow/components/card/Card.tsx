import {Card, CardBody} from '@heroui/react';
import {useAppState} from '@lynx/redux/reducers/app';
import {getAccentColorAsHex} from '@lynx/utils/accentColorGenerator';
import {extractGitUrl} from '@lynx_common/utils';
import {motion} from 'framer-motion';
import {memo, useMemo} from 'react';

import {CardHeaderContent} from './CardHeaderContent';
import Footer from './Footer';
import {useCardStore} from './store';
import {useCardActions} from './useCardActions';
import {useCardTitle} from './useCardTitle';

type AccentStyle = React.CSSProperties & {'--accent-bg-color'?: string};

/**
 * Main Card component for displaying a plugin/module.
 */
const LynxCard = memo(() => {
  const isInstalled = useCardStore(state => state.installed);
  const title = useCardStore(state => state.title);
  const repoUrl = useCardStore(state => state.repoUrl);
  const description = useCardStore(state => state.description);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  const {startAi, install, isRunning, updating, updateAvailable, isUpdatingExtensions, updateCount} = useCardActions();

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

  return (
    <Card
      className={
        'relative h-52.5 w-75 border border-foreground-100 px-2 shadow-md transition-all duration-300 ' +
        'group hover:scale-[1.02] hover:shadow-lg'
      }
      as={motion.div}
      whileHover="hover"
      onContextMenu={() => setMenuIsOpen(true)}
      onPress={isInstalled ? startAi : install}
      isPressable={!isRunning && !updating && !isUpdatingExtensions}>
      <div
        style={accentStyle}
        className={`absolute inset-0 z-0 scale-150 opacity-50 ${isInstalled ? 'bg-installed' : 'bg-uninstalled'}`}
      />

      <CardHeaderContent
        modifiedTitle={modifiedTitle}
        onTitleChange={onTitleChange}
        updateAvailable={updateAvailable}
      />

      <CardBody className="justify-center py-2">
        <span className="line-clamp-3 text-sm text-foreground-500">{description}</span>
      </CardBody>

      <Footer
        updating={updating}
        isRunning={isRunning}
        updateCount={updateCount}
        id={useCardStore(state => state.id)}
        updatingExtensions={isUpdatingExtensions}
      />
    </Card>
  );
});

export default LynxCard;
