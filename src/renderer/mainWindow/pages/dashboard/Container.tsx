import {extensionsData} from '@lynx/plugins/extensions/loader';
import staticsIpc from '@lynx_shared/ipc/statics';
import {isEmpty} from 'lodash';
import {useEffect, useMemo, useState} from 'react';

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

export const DashboardSections = () => {
  const content = useMemo(() => extensionsData.customizePages.dashboard.add.content, []);

  const [creditsAvailable, setCreditsAvailable] = useState<boolean>(false);
  useEffect(() => {
    staticsIpc.getPatrons().then(cr => {
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
