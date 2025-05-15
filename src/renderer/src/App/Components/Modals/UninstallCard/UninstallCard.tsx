import {Button, ButtonGroup, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip} from '@heroui/react';
import {Fragment, useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {ShieldCross_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {useGetUninstallType} from '../../../Modules/ModuleLoader';
import {modalActions, useModalsState} from '../../../Redux/Reducer/ModalsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {REMOVE_MODAL_DELAY} from '../../../Utils/Constants';
import {lynxTopToast, useDisableTooltip, useInstalledCard} from '../../../Utils/UtilHooks';

type Props = {cardId: string; isOpen: boolean; tabID: string};

const UninstallCard = ({cardId, isOpen, tabID}: Props) => {
  const activeTab = useTabsState('activeTab');
  const card = useInstalledCard(cardId);
  const dispatch = useDispatch<AppDispatch>();
  const disableTooltip = useDisableTooltip(true);
  const uninstallType = useGetUninstallType(cardId);

  const closeHandle = useCallback(() => {
    dispatch(modalActions.closeUninstallCard({tabID: activeTab}));
    setTimeout(() => {
      dispatch(modalActions.removeUninstallCard({tabID: activeTab}));
    }, REMOVE_MODAL_DELAY);
  }, [dispatch, activeTab]);

  const onOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) closeHandle();
    },
    [activeTab, closeHandle],
  );

  const uninstallHandle = useCallback(
    (type: 'removeDir' | 'trashDir') => {
      if (card) {
        closeHandle();

        const promise = new Promise<void>(resolve => {
          rendererIpc.file[type](card.dir!)
            .then(() => {
              rendererIpc.storageUtils.removeInstalledCard(cardId);
              resolve();
              lynxTopToast.success(type === 'removeDir' ? 'Uninstalled successfully.' : 'Moved to trash successfully.');
            })
            .catch(() => {
              resolve();
              lynxTopToast.error(
                type === 'removeDir'
                  ? 'An error occurred while uninstalling.'
                  : 'An error occurred while moving to trash.',
              );
            });
        });

        lynxTopToast.loading(type === 'removeDir' ? 'Uninstalling...' : 'Moving to trash...', promise);
      }
    },
    [card, cardId, closeHandle],
  );

  const remove = useCallback(() => uninstallHandle('removeDir'), [uninstallHandle]);

  const trash = useCallback(() => uninstallHandle('trashDir'), [uninstallHandle]);

  const uninstall = useCallback(() => {
    if (card) {
      closeHandle();

      const promise = new Promise<void>(resolve => {
        rendererIpc.module
          .uninstallCardByID(cardId, card.dir)
          .then(() => {
            resolve();
            rendererIpc.storageUtils.removeInstalledCard(cardId);
            lynxTopToast.success('Uninstalled successfully.');
          })
          .catch(() => {
            resolve();
            lynxTopToast.error('An error occurred while uninstalling.');
          });
      });

      lynxTopToast.loading('Uninstalling...', promise);
    }
  }, [card, cardId, closeHandle]);
  const show = useMemo(() => (activeTab === tabID ? 'flex' : 'hidden'), [activeTab, tabID]);

  return (
    <Modal
      classNames={{
        backdrop: `!top-10 !z-10 ${show}`,
        wrapper: `!top-10 scrollbar-hide ${show}`,
      }}
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
