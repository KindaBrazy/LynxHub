import {Button, Card, CardBody, CardHeader, ScrollShadow} from '@heroui/react';
import {Typography} from 'antd';
import {isEmpty} from 'lodash';
import {ReactNode, useCallback, useEffect, useMemo, useState} from 'react';

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
import {dashboardSectionId} from './DashboardContainer';

const {Text} = Typography;

type GroupItem = {
  icon: ReactNode;
  title: string;
  color?: 'danger' | 'warning' | 'success';
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

/** Dashboard navigation bar group and items */
const DashboardGroupSection = ({title, items, danger = false, activeSection}: GroupProps & {activeSection: string}) => {
  const onPress = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'});
  }, []);

  return (
    <div className="mt-3 flex flex-col space-y-3 text-start">
      <Text className={`text-medium font-bold ${danger ? 'text-danger' : ''}`}>{title}</Text>
      <div className="space-y-2">
        {items.map(item => (
          <Button
            className={`flex cursor-default justify-start ${activeSection === item.elementId && 'bg-default-200'}`}
            size="sm"
            variant="light"
            color={item.color || 'default'}
            key={`${item.title}_dashboard_section`}
            onPress={() => onPress(item.elementId)}
            fullWidth>
            {item.icon}
            <Text>{item.title}</Text>
          </Button>
        ))}
      </div>
    </div>
  );
};

const DashboardPageNav = () => {
  const buttons = useMemo(() => extensionsData.customizePages.dashboard.add.navButton, []);
  const [sections, setSections] = useState<GroupProps[]>(initialGroupSections);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    rendererIpc.statics.getPatrons().then(cr => {
      if (!isEmpty(cr)) {
        const updatedSections = JSON.parse(JSON.stringify(initialGroupSections));
        updatedSections[0].items.push({
          title: 'Credits',
          icon: <UserHeart_Icon className="size-4 shrink-0" />,
          elementId: dashboardSectionId.DashboardCreditsId,
        });
        setSections(updatedSections);
      }
    });
  }, []);

  // Collect all item IDs across all groups
  const allItemIds = useMemo(() => {
    return sections.flatMap(group => group.items.map(item => item.elementId));
  }, [sections]);

  // Set up intersection observers for all sections globally
  useEffect(() => {
    let observers: IntersectionObserver[] = [];
    let timeoutId: NodeJS.Timeout;

    const setupObservers = () => {
      if (allItemIds.length === 0) return;

      // Find the scroll container
      const firstElem = document.getElementById(allItemIds[0]);
      if (!firstElem) {
        timeoutId = setTimeout(setupObservers, 100);
        return;
      }

      // Find the OverlayScrollbars viewport
      let scrollContainer: Element | null = firstElem;
      while (scrollContainer && !scrollContainer.classList.contains('os-viewport')) {
        scrollContainer = scrollContainer.parentElement;
      }

      // Track intersection ratios for ALL sections globally
      const intersectionRatios = new Map<string, number>();

      allItemIds.forEach(itemId => {
        const elem = document.getElementById(itemId);
        if (elem) {
          const observer = new IntersectionObserver(
            ([entry]) => {
              intersectionRatios.set(itemId, entry.intersectionRatio);

              // Find the section with the highest intersection ratio across ALL groups
              let maxRatio = 0;
              let topSection = '';
              intersectionRatios.forEach((ratio, id) => {
                if (ratio > maxRatio) {
                  maxRatio = ratio;
                  topSection = id;
                }
              });

              if (maxRatio > 0.1) {
                setActiveSection(topSection);
              }
            },
            {
              root: scrollContainer,
              threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            },
          );
          observer.observe(elem);
          observers.push(observer);
        }
      });
    };

    timeoutId = setTimeout(setupObservers, 100);

    return () => {
      clearTimeout(timeoutId);
      observers.forEach(observer => observer.disconnect());
    };
  }, [allItemIds]);

  return (
    <Card className={`h-full w-48 shrink-0 border-1 border-foreground-100 ${ContainersBg}`}>
      <CardHeader className="justify-center gap-x-2 pt-5">
        <UserDuo_Icon className="size-5" />
        <span>Dashboard</span>
      </CardHeader>
      <CardBody className="pt-0" as={ScrollShadow} hideScrollBar>
        {sections.map((section, index) => (
          <DashboardGroupSection key={index} {...section} activeSection={activeSection} />
        ))}
        {buttons.map((Btn, index) => (
          <Btn key={index} />
        ))}
      </CardBody>
    </Card>
  );
};

export default DashboardPageNav;
