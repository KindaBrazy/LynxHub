import DashboardAbout, {DashboardAboutId} from './Content/Dashboard-About';
import DashboardCredits, {DashboardCreditsId} from './Content/Dashboard-Credits';
import DashboardProfile, {DashboardProfileId} from './Content/Dashboard-Profile';
import DashboardReportIssue, {DashboardReportIssueId} from './Content/Dashboard-ReportIssue';
import DashboardUpdate, {DashboardUpdateId} from './Content/Dashboard-Update';

export const dashboardSectionId = {
  DashboardProfileId,
  DashboardUpdateId,
  DashboardCreditsId,
  DashboardReportIssueId,
  DashboardAboutId,
};

export const DashboardSections = () => (
  <>
    <DashboardProfile />
    <DashboardUpdate />
    <DashboardCredits />
    <DashboardReportIssue />
    <DashboardAbout />
  </>
);
