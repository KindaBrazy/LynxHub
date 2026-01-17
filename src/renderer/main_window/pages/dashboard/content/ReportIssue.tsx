import {Button} from '@heroui/react';
import {ISSUE_PAGE} from '@lynx_cross/consts';

import {ExternalDuo_Icon, GitHub_Icon, SmileCircleDuo_Icon} from '../../../../shared/assets/icons';
import SettingsSection from '../../../components/ContentSection';

export const DashboardReportIssueId = 'settings_report_issue_elem';

/** Reporting app issues on GitHub */
export default function DashboardReportIssue() {
  return (
    <SettingsSection
      title="Help & Feedback"
      id={DashboardReportIssueId}
      icon={<SmileCircleDuo_Icon className="size-5" />}
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
        endContent={<ExternalDuo_Icon className="size-3.5" />}
        className="mt-4 font-medium transition-all duration-200 hover:shadow-lg"
        fullWidth>
        Open an Issue
      </Button>
    </SettingsSection>
  );
}
