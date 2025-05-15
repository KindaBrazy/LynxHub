import {Button} from '@heroui/react';
import {Typography} from 'antd';

import {ISSUE_PAGE} from '../../../../../../../../cross/CrossConstants';
import {Bug_Icon, ExternalLink_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import SettingsSection from '../../Settings/SettingsPage-ContentSection';

const {Paragraph} = Typography;
export const DashboardReportIssueId = 'settings_report_issue_elem';

/** Reporting app issues on GitHub */
export default function DashboardReportIssue() {
  return (
    <SettingsSection
      title="Report an Issue"
      id={DashboardReportIssueId}
      icon={<Bug_Icon className="size-5" />}
      itemsCenter>
      <Paragraph>
        <span>If you encounter any issues with the app, please open a new issue on my GitHub repository.</span>
        <br /> <br />
        <span>This will help me investigate and resolve the problem more effectively.</span>
      </Paragraph>

      <Button endContent={<ExternalLink_Icon />} onPress={() => window.open(ISSUE_PAGE)} fullWidth>
        Report
      </Button>
    </SettingsSection>
  );
}
