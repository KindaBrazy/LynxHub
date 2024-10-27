import {CircularProgress} from '@nextui-org/react';
import {Outlet} from 'react-router-dom';

import {useExtensions} from '../../Extensions/ExtensionsContext';
import {useModules} from '../../Modules/ModulesContext';
import {useCardsState} from '../../Redux/AI/CardsReducer';
import {useAppState} from '../../Redux/App/AppReducer';
import {dashboardRoutePath} from '../Pages/SettingsPages/Dashboard/DashboardPage';
import {settingsRoutePath} from '../Pages/SettingsPages/Settings/SettingsPage';
import RunningCardView from '../RunningCardView/RunningCardView';

export default function ContentLoading() {
  const {isRunning} = useCardsState('runningCard');
  const navBar = useAppState('navBar');
  const currentPage = useAppState('currentPage');

  const {loadingModules} = useModules();
  const {loadingExtensions} = useExtensions();

  if (!loadingModules && !loadingExtensions)
    return (
      <div
        className={`size-full p-3 pt-1.5 ${
          (currentPage === settingsRoutePath || currentPage === dashboardRoutePath) && navBar && 'pl-0'
        } transition-all duration-300`}>
        {isRunning ? <RunningCardView /> : <Outlet />}
      </div>
    );

  return loadingModules ? (
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
  ) : (
    loadingExtensions && (
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
    )
  );
}
