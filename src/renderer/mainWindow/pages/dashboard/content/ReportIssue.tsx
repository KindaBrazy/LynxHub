import {Button} from '@heroui/react';
import SettingsSection from '@lynx/components/SettingsSection';
import {GitHub_Icon} from '@lynx_assets/icons';
import {ISSUE_PAGE} from '@lynx_common/consts';
import {Bug, SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

export const DashboardReportIssueId = 'settings_report_issue_elem';

/** Reporting app issues on GitHub */
const DashboardReportIssue = memo(() => {
  return (
    <SettingsSection title="Help & Feedback" id={DashboardReportIssueId} icon={<Bug className="size-5" />}>
      <div className="flex flex-col items-center text-center gap-4 mx-auto py-2">
        <p className="text-sm text-default-500">
          Found a bug or have feedback? I'd love to hear from you. Share your experience on GitHub to help improve the
          app.
        </p>

        <Button onPress={() => window.open(ISSUE_PAGE)}>
          <GitHub_Icon />
          Open an Issue
          <SquareTopDown className="size-3.5" />
        </Button>
      </div>
    </SettingsSection>
  );
});

DashboardReportIssue.displayName = 'DashboardReportIssue';

export default DashboardReportIssue;
