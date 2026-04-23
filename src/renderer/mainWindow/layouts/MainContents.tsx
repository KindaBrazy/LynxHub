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
  const tabs = useTabsState('tabs');
  const activeTab = useTabsState('activeTab');

  const navBar = useAppState('navBar');
  const activePage = useTabsState('activePage');

  const isSettingsOrDashboard = activePage === PageID.settings || activePage === PageID.dashboard;
  const paddingClass = isSettingsOrDashboard && navBar ? 'pl-0' : '';

  return (
    <div className="absolute inset-0 top-10! flex flex-col transition duration-300">
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;

        return (
          <div
            id={`${tab.id}_wrapper`}
            key={`${tab.id}_wrapper`}
            style={{transform: 'translate(0)'}}
            className={`${isActive ? 'flex' : 'hidden'} size-full flex flex-row overflow-hidden`}>
            <NavBar tabID={tab.id} pageID={tab.pageID} />
            <div className={`size-full p-3 pt-1.5 ${paddingClass} transition-all duration-300`}>
              <AppPages tabID={tab.id} pageID={tab.pageID} />
            </div>
          </div>
        );
      })}

      <StatusBar />
    </div>
  );
});

export default MainContents;
