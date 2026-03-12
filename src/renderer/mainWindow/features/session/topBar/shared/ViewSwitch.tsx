import {Button, Tooltip} from '@heroui/react';
import {cardsActions} from '@lynx/redux/reducers/cards';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {Terminal_Icon} from '@lynx_assets/icons';
import {Earth} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';
import {useDispatch} from 'react-redux';

type Props = {
  /**
   * The current view mode of the session.
   */
  currentView: 'browser' | 'terminal';
};

/**
 * A button to switch between browser and terminal views.
 */
const ViewSwitch = memo(({currentView}: Props) => {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

  const handlePress = () => {
    dispatch(cardsActions.toggleRunningCardView({tabId: activeTab}));
  };

  const isBrowser = currentView === 'browser';
  const tooltipContent = isBrowser ? 'Switch to Terminal' : 'Switch to Browser';

  return (
    <Tooltip delay={500} content={tooltipContent}>
      <Button size="sm" variant="light" color="primary" onPress={handlePress} aria-label={tooltipContent} isIconOnly>
        {isBrowser ? <Terminal_Icon className="size-4" /> : <Earth className="size-4" />}
      </Button>
    </Tooltip>
  );
});

ViewSwitch.displayName = 'ViewSwitch';

export default ViewSwitch;
