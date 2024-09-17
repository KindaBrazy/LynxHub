import {CircularProgress} from '@nextui-org/react';
import {memo} from 'react';
import {Outlet} from 'react-router-dom';

import {useModules} from '../Modules/ModulesContext';
import {useCardsState} from '../Redux/AI/CardsReducer';
import {useAppState} from '../Redux/App/AppReducer';
import NavBar from './NavBar/NavBar';
import {dashboardRoutePath} from './Pages/SettingsPages/Dashboard/DashboardPage';
import {settingsRoutePath} from './Pages/SettingsPages/Settings/SettingsPage';
import RunningCardView from './RunningCardView/RunningCardView';

/** Main app contents */
const MainContents = memo(() => {
  const {isRunning} = useCardsState('runningCard');
  const navBar = useAppState('navBar');
  const currentPage = useAppState('currentPage');
  const {isLoading} = useModules();

  return (
    <div className={`absolute inset-0 top-10 flex flex-col transition duration-300`}>
      <div className="relative flex size-full flex-row overflow-hidden">
        {navBar && <NavBar />}

        {isLoading ? (
          <div className="mr-16 flex size-full scale-125 items-center justify-center">
            <CircularProgress
              classNames={{
                svg: 'w-28 h-28 drop-shadow-md',
                indicator: 'stroke-secondary',
                track: 'stroke-foreground/5',
                value: 'text-3xl font-semibold text-white',
                label: 'font-bold text-medium',
              }}
              strokeWidth={4}
              label="Loading Modules..."
            />
          </div>
        ) : (
          <div
            className={`size-full p-3 pt-1.5 ${
              (currentPage === settingsRoutePath || currentPage === dashboardRoutePath) && navBar && 'pl-0'
            } transition-all duration-300`}>
            {isRunning ? <RunningCardView /> : <Outlet />}
          </div>
        )}
      </div>
    </div>
  );
});

export default MainContents;
