import {Button, ButtonGroup, Modal} from '@heroui-v3/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {ShieldCross} from '@solar-icons/react-perf/BoldDuotone';
import {Fragment, memo, useCallback, useMemo} from 'react';

import {extensionsData} from '../../../plugins/extensions/loader';
import {useModalsState} from '../../../redux/reducers/modals';
import TabModal from '../../TabModal';
import {useTabModalLifecycle} from '../useTabModalManager';

type Props = {
  cardId: string;
  isOpen: boolean;
  tabID: string;
};

const UnassignDialog = memo(({cardId, isOpen, tabID}: Props) => {
  const {onOpenChange} = useTabModalLifecycle('cardUnassign', tabID);

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
    <TabModal size="lg" isOpen={isOpen}>
      <Modal.Header>
        <Modal.Heading className="flex items-center gap-x-2">
          <ShieldCross className="text-warning size-7" />
          <span className="text-warning">Confirm Unassign</span>
        </Modal.Heading>
      </Modal.Header>
      <Modal.Body>
        <span>This action will remove the AI interface from LynxHub and all files and data will remain on disk.</span>
        <span className="font-semibold">Are you sure you want to proceed?</span>
      </Modal.Body>
      <Modal.Footer>
        <ButtonGroup size="sm" fullWidth>
          <Button variant="primary" onPress={closeHandle}>
            Cancel
          </Button>
          <Button variant="danger-soft" onPress={() => unassign(false)}>
            Unassign
          </Button>
          <Button variant="danger" onPress={() => unassign(true)}>
            Unassign & Clear Configs
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </TabModal>
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
