import {memo} from 'react';

import {useAppState} from '../../Redux/Reducer/AppReducer';
import {PageID} from '../../Utils/Constants';
import NavBar from '../NavBar/NavBar';
import AppPages from './AppPages';
import StatusBar from './StatusBar';

/** Main app contents */
const MainContents = memo(() => {
  const navBar = useAppState('navBar');
  const currentPage = useAppState('currentPage');

  return (
    <div className="absolute inset-0 !top-10 flex flex-col transition duration-300">
      <div className="relative flex size-full flex-row overflow-hidden">
        <NavBar />
        <div
          className={`size-full p-3 pt-1.5 ${
            (currentPage === PageID.settingsPageID || currentPage === PageID.dashboardPageID) && navBar && 'pl-0'
          } transition-all duration-300`}>
          <AppPages />
        </div>
      </div>
      <StatusBar />
    </div>
  );
});

export default MainContents;
