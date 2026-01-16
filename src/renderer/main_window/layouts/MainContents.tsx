import {memo} from 'react';

import {PageID} from '../../../cross/CrossConstants';
import {useAppState} from '../redux/reducers/app';
import {useTabsState} from '../redux/reducers/tabs';
import AppPages from './AppPages';
import NavBar from './nav_bar';
import StatusBar from './status_bar';

/** Main app contents */
const MainContents = memo(() => {
  const navBar = useAppState('navBar');
  const activePage = useTabsState('activePage');

  return (
    <div className="absolute inset-0 top-10! flex flex-col transition duration-300">
      <div className="relative flex size-full flex-row overflow-hidden">
        <NavBar />
        <div
          className={`size-full p-3 pt-1.5 ${
            (activePage === PageID.settings || activePage === PageID.dashboard) && navBar && 'pl-0'
          } transition-all duration-300`}>
          <AppPages />
        </div>
      </div>
      <StatusBar />
    </div>
  );
});

export default MainContents;
