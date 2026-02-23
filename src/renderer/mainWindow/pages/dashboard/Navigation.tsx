import {Button, Card, CardBody, CardHeader, ScrollShadow} from '@heroui/react';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {ContainersBg} from '@lynx/utils/commonStyles';
import {DashboardPage_Icon} from '@lynx_assets/icons/pages';
import staticsIpc from '@lynx_shared/ipc/statics';
import {Download, HeartPulse2, InfoSquare, SmileCircle} from '@solar-icons/react-perf/BoldDuotone';
import {motion} from 'framer-motion';
import {isEmpty} from 'lodash';
import {memo, ReactNode, useCallback, useEffect, useMemo, useState} from 'react';

import SettingsSearchHighlight from '../settings/SettingsSearchHighlight';
import {dashboardSectionId} from './Container';
import {useScrollSpy} from './useScrollSpy';

type GroupItem = {
  icon: ReactNode;
  title: string;
  color?: 'danger' | 'warning' | 'success' | 'default';
  elementId: string;
};

type GroupProps = {
  title: string;
  items: GroupItem[];
  danger?: boolean;
};

const initialGroupSections: GroupProps[] = [
  {
    title: 'Application',
    items: [
      {
        title: 'Profiles',
        icon: <DashboardPage_Icon className="size-4 shrink-0" />,
        elementId: dashboardSectionId.DashboardProfileId,
      },
      {
        title: 'Updates',
        icon: <Download className="size-4 shrink-0" />,
        elementId: dashboardSectionId.DashboardUpdateId,
      },
    ],
  },
  {
    title: 'Info',
    items: [
      {
        title: 'Help & Feedback',
        icon: <SmileCircle className="size-4 shrink-0" />,
        elementId: dashboardSectionId.DashboardReportIssueId,
      },
      {
        title: 'About',
        icon: <InfoSquare className="size-4 shrink-0" />,
        elementId: dashboardSectionId.DashboardAboutId,
      },
    ],
  },
];

/** Dashboard navigation bar group and items */
const DashboardGroupSection = memo(
  ({title, items, danger = false, activeSection}: GroupProps & {activeSection: string}) => {
    const onPress = useCallback((id: string) => {
      document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, []);

    return (
      <div className="mt-3 flex flex-col gap-y-2 text-start">
        <span className={`font-semibold text-sm uppercase tracking-tight ${danger ? 'text-danger' : ''}`}>{title}</span>
        <div className="flex flex-col gap-y-1">
          {items.map(item => (
            <Button
              size="sm"
              variant="light"
              color={item.color || 'default'}
              key={`${item.title}_settings_section`}
              onPress={() => onPress(item.elementId)}
              className={`duration-100 overflow-visible ${activeSection === item.elementId && 'cursor-default'}`}
              fullWidth
              disableRipple>
              <div className="z-10 flex justify-start w-full items-center gap-x-1.5 text-[0.82rem] font-medium">
                {item.icon}
                <SettingsSearchHighlight text={item.title} />
              </div>
              {activeSection === item.elementId && (
                <motion.div
                  layoutId="setting_nav_indicator"
                  transition={{duration: 0.4, type: 'spring'}}
                  className="absolute inset-0 z-0 bg-primary/50 rounded-lg"
                />
              )}
            </Button>
          ))}
        </div>
      </div>
    );
  },
);

DashboardGroupSection.displayName = 'DashboardGroupSection';

const DashboardNavigation = memo(() => {
  const buttons = useMemo(
    () => extensionsData.customizePages.dashboard.add.navButton as React.ComponentType<any>[],
    [],
  );
  const [sections, setSections] = useState<GroupProps[]>(initialGroupSections);

  useEffect(() => {
    let mounted = true;
    staticsIpc.getPatrons().then(cr => {
      if (!mounted) return;
      if (!isEmpty(cr)) {
        setSections(prev => {
          // Avoid duplicate addition if this runs multiple times
          if (prev[0].items.some(item => item.elementId === dashboardSectionId.DashboardCreditsId)) {
            return prev;
          }

          const updatedSections = JSON.parse(JSON.stringify(initialGroupSections));
          updatedSections[0].items.push({
            title: 'Credits',
            icon: <HeartPulse2 className="size-4 shrink-0" />,
            elementId: dashboardSectionId.DashboardCreditsId,
          });
          return updatedSections;
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Collect all item IDs across all groups
  const allItemIds = useMemo(() => {
    return sections.flatMap(group => group.items.map(item => item.elementId));
  }, [sections]);

  const activeSection = useScrollSpy(allItemIds);

  return (
    <Card className={`h-full my-2 text-medium w-48 shrink-0 border-1 border-foreground-100 ${ContainersBg}`}>
      <CardHeader className="justify-center gap-x-2 pt-4">
        <DashboardPage_Icon className="size-5" />
        <span>Dashboard</span>
      </CardHeader>
      <CardBody className="pt-0" as={ScrollShadow} hideScrollBar>
        {sections.map((section, index) => (
          <DashboardGroupSection key={index} {...section} activeSection={activeSection} />
        ))}
        {buttons.map((Btn, index) => (
          <Btn key={`nav-btn-${index}`} />
        ))}
      </CardBody>
    </Card>
  );
});

DashboardNavigation.displayName = 'DashboardNavigation';

export default DashboardNavigation;
