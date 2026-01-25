import {Button, ButtonGroup, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip} from '@heroui/react';
import {lynxTopToast, useDisableTooltip, useInstalledCard} from '@lynx/hooks/utils';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useGetUninstallType} from '@lynx/plugins/modules';
import {useModalsState} from '@lynx/redux/reducers/modals';
import {AppDispatch} from '@lynx/redux/store';
import {ShieldCross_Icon} from '@lynx_assets/icons';
import filesIpc from '@lynx_shared/ipc/files';
import moduleIpc from '@lynx_shared/ipc/plugins/module';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {Fragment, useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {useTabModalLifecycle} from '../useTabModalManager';

type Props = {cardId: string; isOpen: boolean; tabID: string};

const UninstallCard = ({cardId, isOpen, tabID}: Props) => {
  const card = useInstalledCard(cardId);
  const dispatch = useDispatch<AppDispatch>();
  const disableTooltip = useDisableTooltip(true);
  const uninstallType = useGetUninstallType(cardId);

  const {onOpenChange, show} = useTabModalLifecycle('cardUninstall', tabID);

  const closeHandle = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const uninstallHandle = useCallback(
    (type: 'removeDir' | 'trashDir') => {
      if (card) {
        closeHandle();

        const promise = new Promise<void>(resolve => {
          filesIpc[type](card.dir!)
            .then(() => {
              storageUtilsIpc.send.removeInstalledCard(cardId);
              resolve();
              lynxTopToast(dispatch).success(
                type === 'removeDir' ? 'Uninstalled successfully.' : 'Moved to trash successfully.',
              );
            })
            .catch(() => {
              resolve();
              lynxTopToast(dispatch).error(
                type === 'removeDir'
                  ? 'An error occurred while uninstalling.'
                  : 'An error occurred while moving to trash.',
              );
            });
        });

        lynxTopToast(dispatch).loading(type === 'removeDir' ? 'Uninstalling...' : 'Moving to trash...', promise);
      }
    },
    [card, cardId, closeHandle],
  );

  const remove = useCallback(() => uninstallHandle('removeDir'), [uninstallHandle]);

  const trash = useCallback(() => uninstallHandle('trashDir'), [uninstallHandle]);

  const uninstall = useCallback(() => {
    closeHandle();

    const promise = new Promise<void>(resolve => {
      moduleIpc
        .uninstallCardByID(cardId)
        .then(() => {
          storageUtilsIpc.send.removeInstalledCard(cardId);
          lynxTopToast(dispatch).success('Uninstalled successfully.');
        })
        .catch(() => {
          lynxTopToast(dispatch).error('An error occurred while uninstalling.');
        })
        .finally(() => {
          resolve();
        });
    });

    lynxTopToast(dispatch).loading('Uninstalling...', promise);
  }, [cardId, closeHandle]);

  return (
    <Modal
      classNames={{
        backdrop: `top-10! z-10! ${show}`,
        wrapper: `top-10! scrollbar-hide ${show}`,
      }}
      size="xl"
      isOpen={isOpen}
      placement="center"
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
            <Button color="success" onPress={closeHandle}>
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

const UninstallCardComp = () => {
  const Uninstall = useMemo(() => extensionsData.replaceModals.uninstallCard, []);

  const cardUninstallModal = useModalsState('cardUninstallModal');

  return (
    <>
      {cardUninstallModal.map(modal => (
        <Fragment key={`${modal.tabID}_modal`}>{Uninstall ? <Uninstall /> : <UninstallCard {...modal} />}</Fragment>
      ))}
    </>
  );
};

export default UninstallCardComp;
