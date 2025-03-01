import {Button, ButtonGroup, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip} from '@heroui/react';
import {message} from 'antd';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {ShieldCross_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons5';
import {useGetUninstallType} from '../../../Modules/ModuleLoader';
import {modalActions, useModalsState} from '../../../Redux/Reducer/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {useDisableTooltip, useInstalledCard} from '../../../Utils/UtilHooks';

/** Display modal to manage uninstalling a card */
const UninstallCard = () => {
  const {cardId, isOpen} = useModalsState('cardUninstallModal');
  const card = useInstalledCard(cardId);
  const dispatch = useDispatch<AppDispatch>();
  const disableTooltip = useDisableTooltip(true);
  const uninstallType = useGetUninstallType(cardId);

  const closeHandle = useCallback(() => {
    dispatch(modalActions.closeModal('cardUninstallModal'));
  }, [dispatch]);

  const onOpenChange = useCallback((isOpen: boolean) => {
    dispatch(modalActions.setIsOpen({modalName: 'cardUninstallModal', isOpen}));
  }, []);

  const uninstallHandle = useCallback(
    (type: 'removeDir' | 'trashDir') => {
      if (card) {
        closeHandle();

        message.loading({
          content: type === 'removeDir' ? 'Uninstalling...' : 'Moving to trash...',
          key: 'process',
          duration: 0,
        });

        rendererIpc.file[type](card.dir!)
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

  const uninstall = useCallback(() => {
    if (card) {
      closeHandle();

      message.loading({content: 'Uninstalling...', key: 'process', duration: 0});

      rendererIpc.module
        .uninstallCardByID(cardId, card.dir)
        .then(() => {
          message.destroy('process');
          rendererIpc.storageUtils.removeInstalledCard(cardId);
          message.success('Uninstalled successfully.');
        })
        .catch(() => {
          message.destroy('process');
          message.error('An error occurred while uninstalling.');
        });
    }
  }, [card, cardId, closeHandle]);

  return (
    <Modal
      classNames={{
        backdrop: '!top-10 !z-10',
        wrapper: '!top-10 scrollbar-hide',
      }}
      isOpen={isOpen}
      onClose={closeHandle}
      scrollBehavior="inside"
      onOpenChange={onOpenChange}
      className="overflow-hidden"
      hideCloseButton>
      <ModalContent>
        <ModalHeader className="items-center gap-x-2">
          <ShieldCross_Icon className="text-danger size-7" />
          <span className="text-danger">Confirm Uninstallation</span>
        </ModalHeader>
        <ModalBody className="py-0">
          <span>This action will remove the AI interface and all its associated data from your device.</span>
          <span className="font-semibold">Are you sure you want to proceed?</span>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup size="sm" variant="flat" fullWidth>
            <Button color="success" onPress={closeHandle} className="cursor-default">
              Cancel
            </Button>
            {uninstallType === 'removeFolder' ? (
              <>
                <Button color="warning" onPress={trash}>
                  Move to Trash
                </Button>
                <Tooltip
                  content={
                    <div className="flex-col flex px-1 py-2">
                      <div className="text-small font-semibold">This action can not be undone.</div>
                      <div>The folder and its contents will be permanently deleted.</div>
                    </div>
                  }
                  size="sm"
                  delay={200}
                  color="danger"
                  className="max-w-64"
                  isDisabled={disableTooltip}
                  showArrow>
                  <Button color="danger" onPress={remove}>
                    Delete Permanently
                  </Button>
                </Tooltip>
              </>
            ) : (
              <Button color="danger" onPress={uninstall}>
                Uninstall
              </Button>
            )}
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UninstallCard;
