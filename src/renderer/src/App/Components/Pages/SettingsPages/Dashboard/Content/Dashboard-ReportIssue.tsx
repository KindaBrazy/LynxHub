import {Button} from '@heroui/react';

import {ISSUE_PAGE} from '../../../../../../../../cross/CrossConstants';
import {ExternalDuo_Icon} from '../../../../../../../context_menu/Components/SvgIcons';
import {GitHub_Icon, SmileCircleDuo_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import SettingsSection from '../../Settings/SettingsPage-ContentSection';

export const DashboardReportIssueId = 'settings_report_issue_elem';

/** Reporting app issues on GitHub */
export default function DashboardReportIssue() {
  return (
    <SettingsSection
      title="Help & Feedback"
      id={DashboardReportIssueId}
      icon={<SmileCircleDuo_Icon className="size-6" />}
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
