import {Button, Link} from '@heroui/react';
import {ISSUE_PAGE} from '@lynx_common/consts';
import {useDebounceBreadcrumb} from '@lynx_shared/sentry/Breadcrumbs';
import {Collapse, Modal, Space, Typography} from 'antd';
import {Fragment, ReactNode, useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {modalActions, useModalsState} from '../../../redux/reducers/modals';
import {AppDispatch} from '../../../redux/store';

const {Paragraph, Text} = Typography;

/**
 * Component to display "Open Issue" instructions in the warning modal.
 */
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

/**
 * Titles for warning modals mapped by content ID.
 */
const warnTitle: Record<string, ReactNode> = {
  CLONE_REPO: <p className="font-semibold">Unable to clone repository.</p>,
  LOCATE_REPO: <p className="font-semibold">Unable to access selected directory as Git repository.</p>,
};

/**
 * Content for warning modals mapped by content ID.
 */
const warnContent: Record<string, ReactNode> = {
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

/**
 * Component that displays a warning modal based on the global warning state.
 * Uses Ant Design's Modal.warning method.
 */
const WarningModal = () => {
  const {contentId, isOpen} = useModalsState('warningModal');
  const dispatch = useDispatch<AppDispatch>();

  useDebounceBreadcrumb('Warning Modal: ', [isOpen, contentId]);

  const handleClose = useCallback(() => {
    dispatch(modalActions.closeWarning());
    Modal.destroyAll();
  }, [dispatch]);

  useEffect(() => {
    if (isOpen) {
      Modal.warning({
        afterClose: () => {
          dispatch(modalActions.closeWarning());
        },
        centered: true,
        content: warnContent[contentId],
        footer: (
          <div className="mt-4 flex items-end justify-end">
            <Space>
              <Button
                as={Link}
                variant="light"
                color="warning"
                href={ISSUE_PAGE}
                className="hover:text-warning"
                isExternal
                showAnchorIcon>
                Report
              </Button>
              <Button color="danger" variant="light" onPress={handleClose} className="cursor-default">
                Close
              </Button>
            </Space>
          </div>
        ),
        mask: {closable: true},
        okButtonProps: {className: 'cursor-default', color: 'danger'},
        rootClassName: 'scrollbar-hide',
        styles: {mask: {top: '2.5rem'}},
        title: warnTitle[contentId],
        wrapClassName: 'mt-10',
      });
    }
  }, [isOpen, contentId, dispatch, handleClose]);

  return <Fragment />;
};

export default WarningModal;
