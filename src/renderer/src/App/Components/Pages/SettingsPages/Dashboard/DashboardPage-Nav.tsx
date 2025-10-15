import {Card, CardBody, CardHeader, ScrollShadow} from '@heroui/react';
import {isEmpty} from 'lodash';
import {useEffect, useMemo, useState} from 'react';

import {
  Download2_Icon,
  Info_Icon,
  SmileCircleDuo_Icon,
  User_Icon,
  UserDuo_Icon,
  UserHeart_Icon,
} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import rendererIpc from '../../../../RendererIpc';
import {ContainersBg} from '../../../../Utils/CrossStyle';
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
    ],
  },
  {
    title: 'Info',
    items: [
      {
        title: 'Help & Feedback',
        icon: <SmileCircleDuo_Icon className="size-4 shrink-0" />,
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

  const [sections, setSections] = useState<GroupProps[]>(groupSections);

  useEffect(() => {
    rendererIpc.statics.getPatrons().then(cr => {
      if (!isEmpty(cr)) {
        groupSections[0].items.push({
          title: 'Credits',
          icon: <UserHeart_Icon className="size-4 shrink-0" />,
          elementId: dashboardSectionId.DashboardCreditsId,
        });
        setSections(groupSections);
      }
    });
  }, []);

  return (
    <Card className={`h-full w-48 shrink-0 border-1 border-foreground-100 ${ContainersBg}`}>
      <CardHeader className="justify-center gap-x-2 pt-5">
        <UserDuo_Icon className="size-5" />
        <span>Dashboard</span>
      </CardHeader>
      <CardBody className="pt-0" as={ScrollShadow} hideScrollBar>
        {sections.map((section, index) => (
          <GroupSection key={index} {...section} />
        ))}
        {buttons.map((Btn, index) => (
          <Btn key={index} />
        ))}
      </CardBody>
    </Card>
  );
};

export default DashboardPageNav;
