import {Button, ButtonGroup, Modal} from '@heroui-v3/react';
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
import {useInstalledCard} from '../../../utils/hooks';
import TabModal from '../../TabModal';
import {useTabModalLifecycle} from '../useTabModalManager';

type Props = {
  cardId: string;
  isOpen: boolean;
  tabID: string;
};

const UninstallDialog = memo(({cardId, isOpen, tabID}: Props) => {
  const card = useInstalledCard(cardId);
  const dispatch = useDispatch<AppDispatch>();
  const uninstallType = useGetUninstallType(cardId);

  const {onOpenChange} = useTabModalLifecycle('cardUninstall', tabID);

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
    <TabModal size="lg" isOpen={isOpen}>
      <Modal.Header>
        <Modal.Heading className="items-center gap-x-2 flex">
          <ShieldCross className="text-danger size-7" />
          <span className="text-danger">Confirm Uninstallation</span>
        </Modal.Heading>
      </Modal.Header>
      <Modal.Body>
        <span>This action will remove the AI interface and all its associated data from your device.</span>
        <span className="font-semibold">Are you sure you want to proceed?</span>
      </Modal.Body>
      <Modal.Footer>
        <ButtonGroup size="sm" fullWidth>
          <Button className="flex-1" onPress={closeHandle}>
            Cancel
          </Button>
          {uninstallType === 'removeFolder' ? (
            <>
              <Button size="sm" onPress={trash} className="flex-1" variant="danger-soft">
                Move to Trash
              </Button>
              <Button size="sm" variant="danger" onPress={remove} className="flex-1">
                Delete Permanently
              </Button>
            </>
          ) : (
            <Button size="sm" variant="danger" className="flex-1" onPress={uninstall}>
              Uninstall
            </Button>
          )}
        </ButtonGroup>
      </Modal.Footer>
    </TabModal>
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
