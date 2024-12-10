import {ScrollShadow} from '@nextui-org/react';
import {Card} from 'antd';
import {useMemo} from 'react';

import {Download2_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons1';
import {Info_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons2';
import {Bug_Icon, User_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons3';
import {UserHeart_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons4';
import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import {GroupProps, GroupSection} from '../Settings/SettingsPage-Nav';
import {dashboardSectionId} from './DashboardContainer';

const groupSections: GroupProps[] = [
  {
    title: 'Application',
    items: [
      {
        title: 'Profiles',
        icon: <User_Icon className="size-4 shrink-0" />,
        elementId: dashboardSectionId.DashboardProfileId,
      },
      {
        title: 'Updates',
        icon: <Download2_Icon className="size-4 shrink-0" />,
        elementId: dashboardSectionId.DashboardUpdateId,
      },
      {
        title: 'Credits',
        icon: <UserHeart_Icon className="size-4 shrink-0" />,
        elementId: dashboardSectionId.DashboardCreditsId,
      },
    ],
  },
  {
    title: 'Info',
    items: [
      {
        title: 'Report an Issue',
        icon: <Bug_Icon className="size-4 shrink-0" />,
        color: 'warning',
        elementId: dashboardSectionId.DashboardReportIssueId,
      },
      {
        title: 'About',
        icon: <Info_Icon className="size-4 shrink-0" />,
        color: 'success',
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
