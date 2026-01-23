import {Button, Link} from '@heroui/react';
import {ISSUE_PAGE} from '@lynx_common/consts';
import {Modal, Space} from 'antd';
import {Fragment, useCallback, useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';

import {useDebounceBreadcrumb} from '../../../../shared/sentry/Breadcrumbs';
import {modalActions, useModalsState} from '../../../redux/reducers/modals';
import {AppDispatch} from '../../../redux/store';
import {warnContent, warnTitle} from './WarningContent';

/** Hook to display a warning */
const WarningModal = () => {
  const {contentId, isOpen} = useModalsState('warningModal');
  const dispatch = useDispatch<AppDispatch>();
  const handleCloseRef = useRef<() => void>(() => {});

  useDebounceBreadcrumb('Warning Modal: ', [isOpen, contentId]);

  const handleClose = useCallback(() => {
    dispatch(modalActions.closeWarning());
    Modal.destroyAll();
  }, [dispatch]);

  useEffect(() => {
    handleCloseRef.current = handleClose;
  }, [handleClose]);

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
              <Button
                color="danger"
                variant="light"
                className="cursor-default"
                onPress={() => handleCloseRef.current()}>
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
  }, [isOpen, contentId, dispatch]);

  return <Fragment />;
};

export default WarningModal;
