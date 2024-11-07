import {Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs} from '@nextui-org/react';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {modalMotionProps} from '../../../Utils/Constants';
import {useIsAutoUpdateExtensions} from '../../../Utils/UtilHooks';
import Available from './Available/Available';
import Clone from './Clone';
import Installed from './Installed';

/** Managing card extension -> install, update, uninstall and etc */
export default function CardExtensions() {
  const [installedExtensions, setInstalledExtensions] = useState<string[]>([]);

  const {isOpen, title, id} = useModalsState('cardExtensions');
  const [currentTab, setCurrentTab] = useState<any>('installed');
  const [updatesAvailable, setUpdatesAvailable] = useState<string[]>([]);
  const [isUpdatingAll, setIsUpdatingAll] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();
  const installedRef = useRef<{updateAll: () => void; getExtensions: () => void}>();
  const autoUpdate = useIsAutoUpdateExtensions(id);

  const onClose = useCallback(() => {
    dispatch(modalActions.closeModal('cardExtensions'));
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

  return (
    <Modal
      radius="md"
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={false}
      scrollBehavior="inside"
      motionProps={modalMotionProps}
      classNames={{backdrop: '!top-10', wrapper: '!top-10 scrollbar-hide'}}
      className="max-w-[80%] border-2 border-foreground/10 dark:border-foreground/5"
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
              ref={installedRef}
              setIsUpdatingAll={setIsUpdatingAll}
              updatesAvailable={updatesAvailable}
              visible={currentTab === 'installed'}
              setUpdatesAvailable={setUpdatesAvailable}
              setInstalledExtensions={setInstalledExtensions}
            />
            <Clone
              updateTable={updateTable}
              visible={currentTab === 'clone'}
              installedExtensions={installedExtensions}
            />
            <Available
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
              <Button color="danger" variant="light" onPress={onClose} className="cursor-default">
                Close
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
