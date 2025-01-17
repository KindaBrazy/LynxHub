import {Button, Tooltip} from '@heroui/react';
import {message, Modal, Space} from 'antd';
import {Fragment, useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {useDisableTooltip, useInstalledCard} from '../../../Utils/UtilHooks';

/** Display modal to manage uninstalling a card */
const UninstallCard = () => {
  const {cardId, isOpen} = useModalsState('cardUninstallModal');
  const card = useInstalledCard(cardId);
  const dispatch = useDispatch<AppDispatch>();
  const disableTooltip = useDisableTooltip(true);

  const closeHandle = useCallback(() => {
    dispatch(modalActions.closeModal('cardUninstallModal'));
    Modal.destroyAll();
  }, [dispatch]);

  const uninstallHandle = useCallback(
    (type: 'removeDir' | 'trashDir') => {
      if (card) {
        closeHandle();

        message.loading({
          content: type === 'removeDir' ? 'Uninstalling...' : 'Moving to trash...',
          key: 'process',
        });

        rendererIpc.file[type](card.dir)
          .then(() => {
            rendererIpc.storageUtils.removeInstalledCard(cardId);
            message.destroy('process');
            message.success(type === 'removeDir' ? 'Uninstalled successfully.' : 'Moved to trash successfully.');
          })
          .catch(() => {
            message.destroy('process');
            message.error(
              type === 'removeDir'
                ? 'An error occurred while uninstalling.'
                : 'An error occurred while moving to trash.',
            );
          });
      }
    },
    [card, cardId, closeHandle],
  );

  const remove = useCallback(() => uninstallHandle('removeDir'), [uninstallHandle]);

  const trash = useCallback(() => uninstallHandle('trashDir'), [uninstallHandle]);

  useEffect(() => {
    if (isOpen && card) {
      Modal.error({
        afterClose: () => {
          dispatch(modalActions.closeModal('cardUninstallModal'));
        },
        centered: true,
        content: (
          <>
            <span>This action will remove the Card and all its associated data from your device.</span>
            <br />
            <span>Are you sure you want to proceed?</span>
          </>
        ),
        footer: (
          <div className="mt-4 flex items-end justify-end">
            <Space>
              <Button variant="light" color="success" onPress={closeHandle} className="cursor-default">
                Cancel
              </Button>
              <Button variant="light" color="warning" onPress={trash} className="cursor-default">
                Move to Trash
              </Button>
              <Tooltip
                content={
                  <div className="m-1 text-center">
                    <span>This action cannot be undone.</span>
                    <br />
                    <span>The folder and its contents will be permanently deleted.</span>
                  </div>
                }
                size="sm"
                delay={200}
                color="danger"
                isDisabled={disableTooltip}
                showArrow>
                <Button color="danger" variant="light" onPress={remove} className="cursor-default">
                  Delete Permanently
                </Button>
              </Tooltip>
            </Space>
          </div>
        ),
        maskClosable: true,
        rootClassName: 'scrollbar-hide',
        styles: {mask: {top: '2.5rem'}},
        wrapClassName: 'mt-10',
        title: 'Confirm Uninstallation',
      });
    }
  }, [isOpen, card, dispatch]);

  return <Fragment />;
};

export default UninstallCard;
