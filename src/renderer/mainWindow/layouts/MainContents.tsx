import {useAppState} from '@lynx/redux/reducers/app';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {PageID} from '@lynx_common/consts';
import {memo} from 'react';

import AppPages from './AppPages';
import NavBar from './navBar';
import StatusBar from './statusBar';

/**
 * Main layout component for the application content area.
 * Renders the Navigation Bar, the main content area (AppPages), and the Status Bar.
 */
const MainContents = memo(() => {
  const navBar = useAppState('navBar');
  const activePage = useTabsState('activePage');

  const isSettingsOrDashboard = activePage === PageID.settings || activePage === PageID.dashboard;
  const paddingClass = isSettingsOrDashboard && navBar ? 'pl-0' : '';

  return (
    <div className="absolute inset-0 top-10! flex flex-col transition duration-300">
      <div className="relative flex size-full flex-row overflow-hidden">
        <NavBar />
        <div className={`size-full p-3 pt-1.5 ${paddingClass} transition-all duration-300`}>
          <AppPages />
        </div>
      </div>
      <StatusBar />
    </div>
  );
});

export default MainContents;
