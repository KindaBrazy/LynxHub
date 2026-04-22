import {Button, ButtonGroup, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip} from '@heroui/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import filesIpc from '@lynx_shared/ipc/files';
import moduleIpc from '@lynx_shared/ipc/plugins/module';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {ShieldCross} from '@solar-icons/react-perf/BoldDuotone';
import {Fragment, memo, useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {extensionsData} from '../../../plugins/extensions/loader';
import {useGetUninstallType} from '../../../plugins/modules';
import {useModalsState} from '../../../redux/reducers/modals';
import {AppDispatch} from '../../../redux/store';
import {useDisableTooltip, useInstalledCard} from '../../../utils/hooks';
import {useTabModalLifecycle} from '../useTabModalManager';

type Props = {
  cardId: string;
  isOpen: boolean;
  tabID: string;
};

const UninstallDialog = memo(({cardId, isOpen, tabID}: Props) => {
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

        const promise = new Promise<void>((resolve, reject) => {
          filesIpc[type](card.dir!)
            .then(() => {
              storageUtilsIpc.send.removeInstalledCard(cardId);
              resolve();
            })
            .catch(reject);
        });

        topToast.promise(promise, {
          loading: type === 'removeDir' ? 'Uninstalling...' : 'Moving to trash...',
          success: type === 'removeDir' ? 'Uninstalled successfully.' : 'Moved to trash successfully.',
          error:
            type === 'removeDir' ? 'An error occurred while uninstalling.' : 'An error occurred while moving to trash.',
        });
      }
    },
    [card, cardId, closeHandle, dispatch],
  );

  const remove = useCallback(() => uninstallHandle('removeDir'), [uninstallHandle]);
  const trash = useCallback(() => uninstallHandle('trashDir'), [uninstallHandle]);

  const uninstall = useCallback(() => {
    closeHandle();

    const promise = new Promise<void>((resolve, reject) => {
      moduleIpc
        .uninstallCardByID(cardId)
        .then(() => {
          storageUtilsIpc.send.removeInstalledCard(cardId);
          resolve();
        })
        .catch(reject);
    });

    topToast.promise(promise, {
      loading: 'Uninstalling...',
      success: 'Uninstalled successfully.',
      error: 'An error occurred while uninstalling.',
    });
  }, [cardId, closeHandle, dispatch]);

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
          <ShieldCross className="text-danger size-7" />
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
});

const UninstallModal = () => {
  const Uninstall = useMemo(() => extensionsData.replaceModals.uninstallCard, []);
  const cardUninstallModal = useModalsState('cardUninstallModal');

  return (
    <>
      {cardUninstallModal.map(modal => (
        <Fragment key={`${modal.tabID}_modal`}>{Uninstall ? <Uninstall /> : <UninstallDialog {...modal} />}</Fragment>
      ))}
    </>
  );
};

export default UninstallModal;
