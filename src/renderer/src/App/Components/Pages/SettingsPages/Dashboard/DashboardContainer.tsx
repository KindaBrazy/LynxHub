import {isEmpty} from 'lodash';
import {useEffect, useMemo, useState} from 'react';

import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import rendererIpc from '../../../../RendererIpc';
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

  const [creditsAvailable, setCreditsAvailable] = useState<boolean>(false);
  useEffect(() => {
    rendererIpc.statics.getPatrons().then(cr => {
      setCreditsAvailable(!isEmpty(cr));
    });
  }, []);

  return (
    <>
      <DashboardProfile />
      <DashboardUpdate />
      {creditsAvailable && <DashboardCredits />}
      <DashboardReportIssue />
      <DashboardAbout />

      {content.map((Content, index) => (
        <Content key={index} />
      ))}
    </>
  );
};
