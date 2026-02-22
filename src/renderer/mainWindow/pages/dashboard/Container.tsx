import {extensionsData} from '@lynx/plugins/extensions/loader';
import staticsIpc from '@lynx_shared/ipc/statics';
import {isEmpty} from 'lodash';
import {ComponentType, memo, useEffect, useMemo, useState} from 'react';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = useMemo(() => extensionsData.customizePages.dashboard.add.content as ComponentType<any>[], []);

  const [creditsAvailable, setCreditsAvailable] = useState<boolean>(false);
  
  useEffect(() => {
    let mounted = true;
    staticsIpc.getPatrons().then(cr => {
      if (mounted) {
        setCreditsAvailable(!isEmpty(cr));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <DashboardProfile />
      <DashboardUpdate />
      {creditsAvailable && <DashboardCredits />}
      <DashboardReportIssue />
      <DashboardAbout />

      {content.map((Content, index) => (
        <Content key={`plugin-content-${index}`} />
      ))}
    </>
  );
});

DashboardSections.displayName = 'DashboardSections';
