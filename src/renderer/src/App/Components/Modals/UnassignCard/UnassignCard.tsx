import {Button, ButtonGroup, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {Fragment, useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {ShieldCross_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {modalActions, useModalsState} from '../../../Redux/Reducer/ModalsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {REMOVE_MODAL_DELAY} from '../../../Utils/Constants';
import {lynxTopToast} from '../../../Utils/UtilHooks';

type Props = {cardId: string; isOpen: boolean; tabID: string};

const UnassignCard = ({cardId, isOpen, tabID}: Props) => {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

  const closeHandle = useCallback(() => {
    dispatch(modalActions.closeUnassignCard({tabID: activeTab}));
    setTimeout(() => {
      dispatch(modalActions.removeUnassignCard({tabID: activeTab}));
    }, REMOVE_MODAL_DELAY);
  }, [dispatch, activeTab]);

  const onOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) closeHandle();
    },
    [activeTab, closeHandle],
  );

  const unassign = useCallback(
    (clearConfig: boolean) => {
      closeHandle();

      rendererIpc.storageUtils
        .unassignCard(cardId, clearConfig)
        .then(() => {
          lynxTopToast.success('Unassigned successfully.');
        })
        .catch(() => {
          lynxTopToast.error('An error occurred while unassigning.');
        });
    },
    [cardId, closeHandle],
  );

  const show = useMemo(() => (activeTab === tabID ? 'flex' : 'hidden'), [activeTab, tabID]);

  return (
    <Modal
      classNames={{
        backdrop: `!top-10 !z-10 ${show}`,
        wrapper: `!top-10 scrollbar-hide ${show}`,
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
          <ShieldCross_Icon className="text-warning size-7" />
          <span className="text-warning">Confirm Unassign</span>
        </ModalHeader>
        <ModalBody className="py-0">
          <span>This action will remove the AI interface from LynxHub and all files and data will remain on disk.</span>
          <span className="font-semibold">Are you sure you want to proceed?</span>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup size="sm" variant="flat" fullWidth>
            <Button color="success" onPress={closeHandle} className="cursor-default">
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
};

const UnassignCardComp = () => {
  const Unassign = useMemo(() => extensionsData.replaceModals.unassignCard, []);

  const cardUnassignModal = useModalsState('cardUnassignModal');

  return (
    <>
      {cardUnassignModal.map(modal => (
        <Fragment key={`${modal.tabID}_modal`}>{Unassign ? <Unassign /> : <UnassignCard {...modal} />}</Fragment>
      ))}
    </>
  );
};

export default UnassignCardComp;
