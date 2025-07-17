import {Button, Link} from '@heroui/react';
import {Modal, Space} from 'antd';
import {Fragment, useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {ISSUE_PAGE} from '../../../../../../cross/CrossConstants';
import {useDebounceBreadcrumb} from '../../../../../Breadcrumbs';
import {modalActions, useModalsState} from '../../../Redux/Reducer/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import {warnContent, warnTitle} from './WarningContent';

/** Hook to display a warning */
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
        maskClosable: true,
        okButtonProps: {className: 'cursor-default', color: 'danger'},
        rootClassName: 'scrollbar-hide',
        styles: {mask: {top: '2.5rem'}},
        title: warnTitle[contentId],
        wrapClassName: 'mt-10',
      });
    }
  }, [isOpen, contentId, handleClose, dispatch]);

  return <Fragment />;
};

export default WarningModal;
