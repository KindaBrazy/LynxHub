import {Button, ButtonGroup, Modal} from '@heroui-v3/react';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {ShieldCross} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useCallback, useMemo} from 'react';

import {topToast} from '../../../../layouts/ToastProviders';
import {extensionsData} from '../../../../plugins/extensions/loader';
import TabModal from '../../../TabModal';
import {useCardStore} from '../../store';
import {CommonProps} from '../about/types';

const UnassignDialog = memo(({state}: CommonProps) => {
  const id = useCardStore(st => st.id);

  const unassign = useCallback(
    (clearConfig: boolean) => {
      state.close();

      storageUtilsIpc.invoke
        .unassignCard(id, clearConfig)
        .then(() => {
          topToast.success('Unassigned successfully.');
        })
        .catch(() => {
          topToast.danger('An error occurred while unassigning.');
        });
    },
    [state, id],
  );

  return (
    <TabModal size="lg" isOpen={state.isOpen}>
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
          <Button variant="primary" onPress={state.close}>
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

const UnassignModal = (props: CommonProps) => {
  const Unassign = useMemo(() => extensionsData.replaceModals.unassignCard, []);

  return Unassign ? <Unassign /> : <UnassignDialog {...props} />;
};

export default UnassignModal;
