import {Button, ButtonGroup, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {ShieldCross} from '@solar-icons/react-perf/BoldDuotone';
import {Fragment, memo, useCallback, useMemo} from 'react';

import {extensionsData} from '../../../plugins/extensions/loader';
import {useModalsState} from '../../../redux/reducers/modals';
import {useTabModalLifecycle} from '../useTabModalManager';

type Props = {
  cardId: string;
  isOpen: boolean;
  tabID: string;
};

const UnassignDialog = memo(({cardId, isOpen, tabID}: Props) => {
  const {onOpenChange, show} = useTabModalLifecycle('cardUnassign', tabID);

  const closeHandle = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const unassign = useCallback(
    (clearConfig: boolean) => {
      closeHandle();

      storageUtilsIpc.invoke
        .unassignCard(cardId, clearConfig)
        .then(() => {
          topToast.success('Unassigned successfully.');
        })
        .catch(() => {
          topToast.danger('An error occurred while unassigning.');
        });
    },
    [cardId, closeHandle],
  );

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
          <ShieldCross className="text-warning size-7" />
          <span className="text-warning">Confirm Unassign</span>
        </ModalHeader>
        <ModalBody className="py-0">
          <span>This action will remove the AI interface from LynxHub and all files and data will remain on disk.</span>
          <span className="font-semibold">Are you sure you want to proceed?</span>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup size="sm" variant="flat" fullWidth>
            <Button color="success" onPress={closeHandle}>
              Cancel
            </Button>
            <Button color="warning" onPress={() => unassign(false)}>
              Unassign
            </Button>
            <Button color="danger" onPress={() => unassign(true)}>
              Unassign & Clear Configs
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

const UnassignModal = () => {
  const Unassign = useMemo(() => extensionsData.replaceModals.unassignCard, []);
  const cardUnassignModal = useModalsState('cardUnassignModal');

  return (
    <>
      {cardUnassignModal.map(modal => (
        <Fragment key={`${modal.tabID}_modal`}>{Unassign ? <Unassign /> : <UnassignDialog {...modal} />}</Fragment>
      ))}
    </>
  );
};

export default UnassignModal;
