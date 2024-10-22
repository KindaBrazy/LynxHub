import {CircularProgress} from '@nextui-org/react';
import {isEmpty} from 'lodash';
import {memo} from 'react';
import {Outlet} from 'react-router-dom';

import {useExtensions} from '../Extensions/ExtensionEnv';
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
  const {loadingModules} = useModules();

  const {loadingExtensions, statusBar} = useExtensions();

  return (
    <div className={`absolute inset-0 top-10 flex flex-col transition duration-300`}>
      <div className="relative flex size-full flex-row overflow-hidden">
        {navBar && <NavBar />}

        {loadingModules ? (
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
              color="secondary"
              label="Loading Modules..."
            />
          </div>
        ) : loadingExtensions ? (
          <div className="mr-16 flex size-full scale-125 items-center justify-center">
            <CircularProgress
              classNames={{
                svg: 'w-28 h-28 drop-shadow-md',
                indicator: 'stroke-secondary',
                track: 'stroke-foreground/5',
                value: 'text-3xl font-semibold text-white',
                label: 'font-bold text-medium',
              }}
              color="primary"
              strokeWidth={4}
              label="Loading Extensions..."
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
      {statusBar?.StatusBar
        ? statusBar.StatusBar
        : !isEmpty(statusBar?.add) && (
            <div
              className={
                'flex h-7 w-full flex-row justify-between border-t border-foreground/10' +
                ' items-center bg-foreground-100 px-3 text-small dark:bg-LynxRaisinBlack'
              }>
              <div>{...statusBar?.add?.start.map((Start, index) => <Start key={index} />)}</div>
              <div>{...statusBar?.add?.center.map((Center, index) => <Center key={index} />)}</div>
              <div>{...statusBar?.add?.end.map((End, index) => <End key={index} />)}</div>
            </div>
          )}
    </div>
  );
});

export default MainContents;
