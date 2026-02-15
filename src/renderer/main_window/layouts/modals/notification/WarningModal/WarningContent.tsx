import {Collapse, Typography} from 'antd';

const {Paragraph, Text} = Typography;

const OpenIssue = () => (
  <Collapse
    items={[
      {
        children: (
          <Paragraph type="warning">
            <span>If you continue to experience problems, please open a new issue on my GitHub repository.</span>
            <br />
            <span>This will allow me to investigate and address the issue more effectively.</span>
          </Paragraph>
        ),
        key: '1',
        label: <Text type="warning">📣 Report an Issue</Text>,
      },
    ]}
    size="small"
    bordered={false}
    className="cursor-default"
  />
);

export const warnTitle = {
  CLONE_REPO: <p className="font-semibold">Unable to clone repository.</p>,
  LOCATE_REPO: <p className="font-semibold">Unable to access selected directory as Git repository.</p>,
};

export const warnContent = {
  CLONE_REPO: (
    <>
      <Paragraph className="mt-4" strong>
        Please ensure you have a stable internet connection and try again.
      </Paragraph>
      <Text>If the issue persists, it could be due to one of the following reasons:</Text>
      <Paragraph>
        <ul>
          <li>The directory is empty and you have the necessary permissions to access it..</li>
          <li>The repository is too large, and your network is unable to handle the file transfer.</li>
          <li>Firewalls or proxy settings are blocking the connection.</li>
        </ul>
      </Paragraph>
      <OpenIssue />
    </>
  ),
  LOCATE_REPO: (
    <>
      <Paragraph className="mt-4" strong>
        Please ensure the following:
      </Paragraph>
      <Paragraph>
        <ul>
          <li>The directory exists and you have the necessary permissions to access it.</li>
          <li>The directory is a valid Git repository matching the URL.</li>
        </ul>
      </Paragraph>
      <OpenIssue />
    </>
  ),
};
