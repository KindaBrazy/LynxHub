import {Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs} from '@heroui/react';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {useDebounceBreadcrumb} from '@lynx_shared/sentry/Breadcrumbs';
import {Download} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash';
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';

import {extensionsData} from '../../../../plugins/extensions/loader';
import {useModalsState} from '../../../../redux/reducers/modals';
import {modalMotionProps} from '../../../../utils/constants';
import {useIsAutoUpdateExtensions} from '../../../../utils/hooks';
import {useTabModalLifecycle} from '../../useTabModalManager';
import Available from './available';
import Clone from './Clone';
import {useInstalledExtensions} from './hooks/useInstalledExtensions';
import Installed from './Installed';

type Props = {isOpen: boolean; title: string; id: string; tabID: string; dir: string};

const ExtensionsModalContent = ({isOpen, title, id, dir, tabID}: Props) => {
  const [currentTab, setCurrentTab] = useState<string | number>('installed');
  const autoUpdate = useIsAutoUpdateExtensions(id);

  const {
    extensions,
    installedUrls,
    updatesAvailable,
    isUpdatingAll,
    statusMap,
    isLoading,
    getExtensions,
    checkUpdates,
    deleteExtension,
    disableExtension,
    updateExtension,
    updateAll,
  } = useInstalledExtensions(dir);

  useDebounceBreadcrumb('Card Extension Modal: ', [isOpen, title]);
  useDebounceBreadcrumb('Card Extension Modal Tabs: ', [currentTab]);

  const {onOpenChange, show} = useTabModalLifecycle('cardExtensions', tabID);

  useEffect(() => {
    setCurrentTab('installed');
  }, [isOpen]);

  const onAutoUpdateChange = useCallback(
    () =>
      autoUpdate
        ? storageUtilsIpc.send.removeAutoUpdateExtensions(id)
        : storageUtilsIpc.send.addAutoUpdateExtensions(id),
    [autoUpdate, id],
  );

  const isUpdateAvailable = useMemo(() => {
    return !isEmpty(updatesAvailable);
  }, [updatesAvailable]);

  const isExtensionAvailable = useMemo(() => {
    return !isEmpty(extensions);
  }, [extensions]);

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      isDismissable={false}
      scrollBehavior="inside"
      onOpenChange={onOpenChange}
      motionProps={modalMotionProps}
      classNames={{backdrop: `top-10! ${show}`, wrapper: `top-10! scrollbar-hide ${show}`}}
      className="max-w-[80%] border-2 border-foreground/10 overflow-hidden dark:border-foreground/5"
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
              statusMap={statusMap}
              isLoading={isLoading}
              extensions={extensions}
              checkUpdates={checkUpdates}
              getExtensions={getExtensions}
              deleteExtension={deleteExtension}
              updateExtension={updateExtension}
              disableExtension={disableExtension}
              visible={currentTab === 'installed'}
            />
            <Clone
              dir={dir}
              updateTable={getExtensions}
              visible={currentTab === 'clone'}
              installedExtensions={installedUrls}
            />
            <Available
              id={id}
              dir={dir}
              updateTable={getExtensions}
              installedExtensions={installedUrls}
              visible={currentTab === 'available'}
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
                  onValueChange={onAutoUpdateChange}
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
                  className={`${!isUpdateAvailable && 'cursor-default'}`}
                  startContent={isUpdateAvailable && !isUpdatingAll && <Download />}>
                  {!isUpdateAvailable ? 'No Updates Available' : isUpdatingAll ? 'Updating...' : 'Update All'}
                </Button>
              )}
              <Button color="warning" variant="light" onPress={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ExtensionsModal = () => {
  const CardExt = useMemo(() => extensionsData.replaceModals.cardExtensions, []);

  const cardExtensions = useModalsState('cardExtensions');

  return (
    <>
      {cardExtensions.map(modal => (
        <Fragment key={`${modal.tabID}_modal`}>
          {CardExt ? <CardExt /> : <ExtensionsModalContent {...modal} />}
        </Fragment>
      ))}
    </>
  );
};

export default ExtensionsModal;
