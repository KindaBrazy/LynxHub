import {Button} from '@heroui/react';
import SettingsSection from '@lynx/components/SettingsSection';
import {GitHub_Icon} from '@lynx_assets/icons';
import {ISSUE_PAGE} from '@lynx_common/consts';
import {SmileCircle, SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

export const DashboardReportIssueId = 'settings_report_issue_elem';

/** Reporting app issues on GitHub */
const DashboardReportIssue = memo(() => {
  return (
    <SettingsSection
      title="Help & Feedback"
      id={DashboardReportIssueId}
      icon={<SmileCircle className="size-5" />}
      itemsCenter>
      <div className="flex gap-y-2 flex-col text-center text-gray-600 dark:text-gray-300 leading-relaxed">
        <span>{"Found a bug or have feedback? I'd love to hear from you!"}</span>
        <span>Share your experience on GitHub to help me improve the app.</span>
      </div>

      <Button
        variant="flat"
        color="success"
        startContent={<GitHub_Icon />}
        onPress={() => window.open(ISSUE_PAGE)}
        endContent={<SquareTopDown className="size-3.5" />}
        className="mt-4 font-medium transition-all duration-200 hover:shadow-lg"
        fullWidth>
        Open an Issue
      </Button>
    </SettingsSection>
  );
});

DashboardReportIssue.displayName = 'DashboardReportIssue';

export default DashboardReportIssue;
