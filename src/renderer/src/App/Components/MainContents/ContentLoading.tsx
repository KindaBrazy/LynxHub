import {CircularProgress} from '@nextui-org/react';
import {ReactNode} from 'react';

import {useModules} from '../../Modules/ModulesContext';
import {useAppState} from '../../Redux/App/AppReducer';
import {dashboardRoutePath} from '../Pages/SettingsPages/Dashboard/DashboardPage';
import {settingsRoutePath} from '../Pages/SettingsPages/Settings/SettingsPage';

export default function ContentLoading({children}: {children: ReactNode}) {
  const navBar = useAppState('navBar');
  const currentPage = useAppState('currentPage');

  const {loadingModules} = useModules();

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
    <div
      className={`size-full p-3 pt-1.5 ${
        (currentPage === settingsRoutePath || currentPage === dashboardRoutePath) && navBar && 'pl-0'
      } transition-all duration-300`}>
      {children}
    </div>
  );
}
