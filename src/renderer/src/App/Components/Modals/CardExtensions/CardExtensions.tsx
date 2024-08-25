import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs} from '@nextui-org/react';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import {modalMotionProps} from '../../../Utils/Constants';
import DownloadExtensions from './DownloadExtensions';
import InstalledExtensions from './InstalledExtensions';

/** Managing card extension -> install, update, uninstall and etc */
export default function CardExtensions() {
  const {isOpen, title} = useModalsState('cardExtensions');
  const [currentTab, setCurrentTab] = useState<any>('installed');
  const [updatesAvailable, setUpdatesAvailable] = useState<string[]>([]);
  const [isUpdatingAll, setIsUpdatingAll] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();
  const installedRef = useRef<{updateAll: () => void; getExtensions: () => void}>();

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

  return (
    <Modal
      radius="md"
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={false}
      className="max-w-[80%]"
      scrollBehavior="inside"
      motionProps={modalMotionProps}
      classNames={{backdrop: 'top-10', wrapper: 'top-10 scrollbar-hide'}}
      hideCloseButton>
      <ModalContent>
        <ModalHeader className="flex-col">
          {title || 'Extensions'}
          <Tabs
            variant="solid"
            className="mt-3"
            color="secondary"
            selectedKey={currentTab}
            onSelectionChange={setCurrentTab}
            fullWidth>
            <Tab key="installed" title="Installed" className="cursor-default" />
            <Tab key="download" title="Download" className="cursor-default" />
          </Tabs>
        </ModalHeader>
        <ModalBody className="scrollbar-hide">
          <div className="relative h-fit">
            <InstalledExtensions
              ref={installedRef}
              setIsUpdatingAll={setIsUpdatingAll}
              updatesAvailable={updatesAvailable}
              visible={currentTab === 'installed'}
              setUpdatesAvailable={setUpdatesAvailable}
            />
            <DownloadExtensions updateTable={updateTable} visible={currentTab === 'download'} />
          </div>
        </ModalBody>
        <ModalFooter>
          {currentTab === 'installed' && (
            <Button
              onPress={updateAll}
              variant={isEmpty(updatesAvailable) ? 'light' : 'flat'}
              isDisabled={isEmpty(updatesAvailable) || isUpdatingAll}
              color={isEmpty(updatesAvailable) ? 'default' : 'success'}
              className={`${isEmpty(updatesAvailable) && 'cursor-default'}`}>
              {isEmpty(updatesAvailable) ? 'No Updates Available' : isUpdatingAll ? 'Updating...' : 'Update All'}
            </Button>
          )}
          <Button color="danger" variant="light" onPress={onClose} className="cursor-default">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
