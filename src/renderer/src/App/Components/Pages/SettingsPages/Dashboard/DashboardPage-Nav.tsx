import {ScrollShadow} from '@nextui-org/react';
import {Card} from 'antd';
import {useMemo} from 'react';

import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import {GroupProps, GroupSection} from '../Settings/SettingsPage-Nav';
import {dashboardSectionId} from './DashboardContainer';

const groupSections: GroupProps[] = [
  {
    title: 'Application',
    items: [
      {
        title: 'Profiles',
        icon: 'User',
        elementId: dashboardSectionId.DashboardProfileId,
      },
      {
        title: 'Updates',
        icon: 'Download2',
        elementId: dashboardSectionId.DashboardUpdateId,
      },
      {
        title: 'Credits',
        icon: 'UserHeart',
        elementId: dashboardSectionId.DashboardCreditsId,
      },
    ],
  },
  {
    title: 'Info',
    items: [
      {
        title: 'Report an Issue',
        icon: 'Bug',
        color: 'warning',
        iconColor: true,
        elementId: dashboardSectionId.DashboardReportIssueId,
      },
      {
        title: 'About',
        icon: 'Info',
        color: 'success',
        iconColor: true,
        elementId: dashboardSectionId.DashboardAboutId,
      },
    ],
  },
];

const DashboardPageNav = () => {
  const buttons = useMemo(() => extensionsData.customizePages.dashboard.add.navButton, []);

  return (
    <Card
      className={
        'h-full w-48 shrink-0 border-2 border-foreground/10 text-center' +
        ' dark:border-foreground/5 dark:bg-LynxRaisinBlack'
      }
      bordered={false}
      title="Dashboard">
      <ScrollShadow className="absolute inset-x-3 bottom-4 top-[3.8rem]" hideScrollBar>
        {groupSections.map((section, index) => (
          <GroupSection key={index} {...section} />
        ))}
        {buttons.map((Btn, index) => (
          <Btn key={index} />
        ))}
      </ScrollShadow>
    </Card>
  );
};

export default DashboardPageNav;
