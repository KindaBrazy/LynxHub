import {Button, Link} from '@nextui-org/react';
import {Typography} from 'antd';

import {ISSUE_PAGE} from '../../../../../../../../cross/CrossConstants';
import SettingsSection from '../SettingsPage-ContentSection';

const {Paragraph} = Typography;
export const SettingsReportIssueId = 'settings_report_issue_elem';

/** Reporting app issues on GitHub */
export default function SettingsReportIssue() {
  return (
    <SettingsSection icon="Bug" title="Report an Issue" id={SettingsReportIssueId} itemsCenter>
      <Paragraph>
        <span>If you encounter any issues with the app, please open a new issue on my GitHub repository.</span>
        <br /> <br />
        <span>This will help me investigate and resolve the problem more effectively.</span>
      </Paragraph>
      <Button
        as={Link}
        radius="sm"
        variant="faded"
        href={ISSUE_PAGE}
        className="hover:text-default-600"
        isExternal
        showAnchorIcon>
        Report
      </Button>
    </SettingsSection>
  );
}
