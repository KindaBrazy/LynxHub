import {extensionsData} from '@lynx/plugins/extensions/loader';
import {ComponentType, memo, useMemo} from 'react';

import DashboardAbout, {DashboardAboutId} from './content/About';
import DashboardCredits, {DashboardCreditsId} from './content/Credits';
import DashboardProfile, {DashboardProfileId} from './content/profile';
import DashboardReportIssue, {DashboardReportIssueId} from './content/ReportIssue';
import DashboardUpdate, {DashboardUpdateId} from './content/Update';

export const dashboardSectionId = {
  DashboardProfileId,
  DashboardUpdateId,
  DashboardCreditsId,
  DashboardReportIssueId,
  DashboardAboutId,
};

/**
 * Renders all dashboard sections including built-in and plugin-added ones.
 */
export const DashboardSections = memo(() => {
  const content = useMemo(() => extensionsData.customizePages.dashboard.add.content as ComponentType<any>[], []);

  return (
    <>
      <DashboardProfile />
      <DashboardUpdate />
      <DashboardReportIssue />
      <DashboardCredits />
      <DashboardAbout />

      {content.map((Content, index) => (
        <Content key={`plugin-content-${index}`} />
      ))}
    </>
  );
});

DashboardSections.displayName = 'DashboardSections';
