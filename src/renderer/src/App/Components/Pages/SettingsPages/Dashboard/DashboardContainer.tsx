import {useMemo} from 'react';

import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import DashboardAbout, {DashboardAboutId} from './Content/Dashboard-About';
import DashboardCredits, {DashboardCreditsId} from './Content/Dashboard-Credits';
import DashboardReportIssue, {DashboardReportIssueId} from './Content/Dashboard-ReportIssue';
import DashboardUpdate, {DashboardUpdateId} from './Content/Dashboard-Update';
import DashboardProfile, {DashboardProfileId} from './Content/Profile/Dashboard-Profile';

export const dashboardSectionId = {
  DashboardProfileId,
  DashboardUpdateId,
  DashboardCreditsId,
  DashboardReportIssueId,
  DashboardAboutId,
};

export const DashboardSections = () => {
  const content = useMemo(() => extensionsData.customizePages.dashboard.add.content, []);

  return (
    <>
      <DashboardProfile />
      <DashboardUpdate />
      <DashboardCredits />
      <DashboardReportIssue />
      <DashboardAbout />

      {content.map((Content, index) => (
        <Content key={index} />
      ))}
    </>
  );
};
