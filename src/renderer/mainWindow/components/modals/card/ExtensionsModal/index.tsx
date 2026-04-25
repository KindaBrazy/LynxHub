import {Button, Checkbox, Label, Modal, Tabs} from '@heroui-v3/react';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {useDebounceBreadcrumb} from '@lynx_shared/sentry/Breadcrumbs';
import {Download} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash';
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';

import {extensionsData} from '../../../../plugins/extensions/loader';
import {useModalsState} from '../../../../redux/reducers/modals';
import {useIsAutoUpdateExtensions} from '../../../../utils/hooks';
import TabModal from '../../../TabModal';
import {useTabModalLifecycle} from '../../useTabModalManager';
import useAvailableExtensions from './available';
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

  const {onOpenChange} = useTabModalLifecycle('cardExtensions', tabID);

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

  const {Body, Footer} = useAvailableExtensions({
    id: id,
    dir: dir,
    updateTable: getExtensions,
    installedExtensions: installedUrls,
    visible: currentTab === 'available',
  });

  return (
    <TabModal size="lg" isOpen={isOpen} onOpenChange={onOpenChange} dialogClassName="w-4xl! max-w-4xl!">
      <Modal.CloseTrigger />
      <Modal.Header>
        <Modal.Heading className="flex-col gap-y-2 text-center">
          {title || 'Extensions'}

          <Tabs className="w-full mt-3" onSelectionChange={setCurrentTab} selectedKey={currentTab.toString()}>
            <Tabs.ListContainer>
              <Tabs.List>
                <Tabs.Tab id="installed" className="gap-x-1">
                  Installed
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="available" className="gap-x-1">
                  Available
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="clone" className="gap-x-1">
                  Clone
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
        </Modal.Heading>
      </Modal.Header>

      <Modal.Body className="scrollbar-hide">
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

          {Body}
        </div>
      </Modal.Body>

      <Modal.Footer>
        {currentTab !== 'available' && (
          <div className="flex w-full flex-row justify-between">
            <div>
              {currentTab === 'installed' && (
                <Checkbox
                  variant="secondary"
                  isSelected={autoUpdate}
                  onChange={onAutoUpdateChange}
                  isDisabled={!isExtensionAvailable}>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label className="cursor-pointer">Auto Update on Launch</Label>
                  </Checkbox.Content>
                </Checkbox>
              )}
            </div>
            <div className="space-x-1.5">
              {currentTab === 'installed' && (
                <Button
                  onPress={updateAll}
                  isDisabled={!isUpdateAvailable || isUpdatingAll}
                  variant={isUpdateAvailable ? 'primary' : 'tertiary'}>
                  {isUpdateAvailable && !isUpdatingAll && <Download />}
                  {!isUpdateAvailable ? 'No Updates Available' : isUpdatingAll ? 'Updating...' : 'Update All'}
                </Button>
              )}
            </div>
          </div>
        )}

        {currentTab === 'available' && <div className="flex w-full justify-center">{Footer}</div>}
      </Modal.Footer>
    </TabModal>
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
