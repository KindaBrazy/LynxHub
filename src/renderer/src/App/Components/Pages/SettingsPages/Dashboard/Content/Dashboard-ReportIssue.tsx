import {Button} from '@mantine/core';
import {Typography} from 'antd';

import {ISSUE_PAGE} from '../../../../../../../../cross/CrossConstants';
import {getIconByName} from '../../../../../../assets/icons/SvgIconsContainer';
import SettingsSection from '../../Settings/SettingsPage-ContentSection';

const {Paragraph} = Typography;
export const DashboardReportIssueId = 'settings_report_issue_elem';

/** Reporting app issues on GitHub */
export default function DashboardReportIssue() {
  return (
    <SettingsSection icon="Bug" title="Report an Issue" id={DashboardReportIssueId} itemsCenter>
      <Paragraph>
        <span>If you encounter any issues with the app, please open a new issue on my GitHub repository.</span>
        <br /> <br />
        <span>This will help me investigate and resolve the problem more effectively.</span>
      </Paragraph>
      <Button
        radius="md"
        variant="default"
        className="!transition !duration-300"
        onClick={() => window.open(ISSUE_PAGE)}
        rightSection={getIconByName('ExternalLink', {className: 'text-warning'})}
        fullWidth>
        <span className="text-warning">Report</span>
      </Button>
    </SettingsSection>
  );
}