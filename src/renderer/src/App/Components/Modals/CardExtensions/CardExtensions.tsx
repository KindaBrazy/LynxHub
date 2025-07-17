import {Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs} from '@heroui/react';
import {isEmpty} from 'lodash';
import {Fragment, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {useDebounceBreadcrumb} from '../../../../../Breadcrumbs';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {modalActions, useModalsState} from '../../../Redux/Reducer/ModalsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {modalMotionProps, REMOVE_MODAL_DELAY} from '../../../Utils/Constants';
import {useIsAutoUpdateExtensions} from '../../../Utils/UtilHooks';
import Available from './Available/Available';
import Clone from './Clone';
import Installed from './Installed';

type Props = {isOpen: boolean; title: string; id: string; tabID: string; dir: string};

const CardExtensions = ({isOpen, title, id, dir, tabID}: Props) => {
  const activeTab = useTabsState('activeTab');
  const [installedExtensions, setInstalledExtensions] = useState<string[]>([]);

  const [currentTab, setCurrentTab] = useState<any>('installed');
  const [updatesAvailable, setUpdatesAvailable] = useState<string[]>([]);
  const [isUpdatingAll, setIsUpdatingAll] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();
  const installedRef = useRef<{updateAll: () => void; getExtensions: () => void}>(null);
  const autoUpdate = useIsAutoUpdateExtensions(id);

  useDebounceBreadcrumb('Card Extension Modal: ', [isOpen, title]);
  useDebounceBreadcrumb('Card Extension Modal Tabs: ', [currentTab]);

  const onClose = useCallback(() => {
    dispatch(modalActions.closeCardExtensions({tabID: activeTab}));
    setTimeout(() => {
      dispatch(modalActions.removeCardExtensions({tabID: activeTab}));
    }, REMOVE_MODAL_DELAY);
  }, [dispatch]);

  const updateAll = useCallback(() => {
    installedRef.current?.updateAll();
  }, [installedRef.current]);

  const updateTable = useCallback(() => {
    installedRef.current?.getExtensions();
  }, [installedRef.current]);

  useEffect(() => {
    setUpdatesAvailable([]);
    setCurrentTab('installed');
  }, [isOpen]);

  const onPress = useCallback(
    () =>
      autoUpdate
        ? rendererIpc.storageUtils.removeAutoUpdateExtensions(id)
        : rendererIpc.storageUtils.addAutoUpdateExtensions(id),
    [autoUpdate, id],
  );

  const isUpdateAvailable = useMemo(() => {
    return !isEmpty(updatesAvailable);
  }, [updatesAvailable, id]);

  const isExtensionAvailable = useMemo(() => {
    return !isEmpty(installedExtensions);
  }, [installedExtensions, id]);

  const show = useMemo(() => (activeTab === tabID ? 'flex' : 'hidden'), [activeTab, tabID]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      isDismissable={false}
      scrollBehavior="inside"
      motionProps={modalMotionProps}
      classNames={{backdrop: `!top-10 ${show}`, wrapper: `!top-10 scrollbar-hide ${show}`}}
      className="max-w-[80%] border-2 border-foreground/10 dark:border-foreground/5 overflow-hidden"
      hideCloseButton>
      <ModalContent>
        <ModalHeader className="flex-col gap-y-2 text-center">
          {title || 'Extensions'}
          <Tabs
            variant="solid"
            className="mt-3"
            color="secondary"
            selectedKey={currentTab}
            onSelectionChange={setCurrentTab}
            fullWidth>
            <Tab key="installed" title="Installed" className="cursor-default" />
            <Tab key="available" title="Available" className="cursor-default" />
            <Tab key="clone" title="Clone" className="cursor-default" />
          </Tabs>
        </ModalHeader>
        <ModalBody className="scrollbar-hide">
          <div className="relative h-fit">
            <Installed
              dir={dir}
              isOpen={isOpen}
              ref={installedRef}
              setIsUpdatingAll={setIsUpdatingAll}
              updatesAvailable={updatesAvailable}
              visible={currentTab === 'installed'}
              setUpdatesAvailable={setUpdatesAvailable}
              setInstalledExtensions={setInstalledExtensions}
            />
            <Clone
              dir={dir}
              updateTable={updateTable}
              visible={currentTab === 'clone'}
              installedExtensions={installedExtensions}
            />
            <Available
              id={id}
              dir={dir}
              updateTable={updateTable}
              visible={currentTab === 'available'}
              installedExtensions={installedExtensions}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full flex-row justify-between">
            <div>
              {currentTab === 'installed' && (
                <Checkbox
                  size="sm"
                  isSelected={autoUpdate}
                  onValueChange={onPress}
                  className="cursor-default"
                  isDisabled={!isExtensionAvailable}>
                  Auto Update on Launch
                </Checkbox>
              )}
            </div>
            <div className="space-x-1.5">
              {currentTab === 'installed' && (
                <Button
                  onPress={updateAll}
                  variant={isUpdateAvailable ? 'flat' : 'light'}
                  isDisabled={!isUpdateAvailable || isUpdatingAll}
                  color={isUpdateAvailable ? 'success' : 'default'}
                  className={`${!isUpdateAvailable && 'cursor-default'}`}>
                  {!isUpdateAvailable ? 'No Updates Available' : isUpdatingAll ? 'Updating...' : 'Update All'}
                </Button>
              )}
              <Button color="warning" variant="light" onPress={onClose} className="cursor-default">
                Close
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const CardExtensionsModal = () => {
  const CardExt = useMemo(() => extensionsData.replaceModals.cardExtensions, []);

  const cardExtensions = useModalsState('cardExtensions');

  return (
    <>
      {cardExtensions.map(modal => (
        <Fragment key={`${modal.tabID}_modal`}>{CardExt ? <CardExt /> : <CardExtensions {...modal} />}</Fragment>
      ))}
    </>
  );
};

export default CardExtensionsModal;
