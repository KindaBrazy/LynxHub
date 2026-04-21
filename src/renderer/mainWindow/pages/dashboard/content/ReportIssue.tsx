import {Button} from '@heroui-v3/react';
import SettingsSection from '@lynx/components/SettingsSection';
import {GitHub_Icon} from '@lynx_assets/icons';
import {ISSUE_PAGE} from '@lynx_common/consts';
import {SmileCircle, SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

export const DashboardReportIssueId = 'settings_report_issue_elem';

/** Reporting app issues on GitHub */
const DashboardReportIssue = memo(() => {
  return (
    <SettingsSection title="Help & Feedback" id={DashboardReportIssueId} icon={<SmileCircle className="size-5" />}>
      <p>
        Found a bug or have feedback? I'd love to hear from you, share your experience on GitHub to help me improve the
        app.
      </p>

      <Button onPress={() => window.open(ISSUE_PAGE)} fullWidth>
        <GitHub_Icon />
        Open an Issue
        <SquareTopDown className="size-3.5" />
      </Button>
    </SettingsSection>
  );
});

DashboardReportIssue.displayName = 'DashboardReportIssue';

export default DashboardReportIssue;
