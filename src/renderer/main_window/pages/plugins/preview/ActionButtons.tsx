import {Button, useDisclosure} from '@heroui/react';
import {lynxTopToast} from '@lynx/hooks/utils';
import {pluginsActions, usePluginsState} from '@lynx/redux/reducers/plugins';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {showRestartModal} from '@lynx/utils';
import {extractGitUrl} from '@lynx_common/utils';
import applicationIpc from '@lynx_shared/ipc/application';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {DownloadMinimalistic, SettingsMinimalistic, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {UpdateButton} from '../Elements';
import ModuleConfigModal from '../ModuleConfigModal';
import SecurityWarning from '../SecurityWarning';
import Versions from './Versions';

type Props = {installed: boolean; currentVersion: string};
export default function ActionButtons({installed, currentVersion}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const selectedPlugin = usePluginsState('selectedPlugin');
  const installing = usePluginsState('installing');
  const unInstalling = usePluginsState('unInstalling');
  const activeTab = useTabsState('activeTab');

  const configModal = useDisclosure();

  const isModule = useMemo(() => selectedPlugin?.metadata.type === 'module', [selectedPlugin]);

  const isInstalling = useMemo(
    () => installing.includes(selectedPlugin?.metadata.id || ''),
    [installing, selectedPlugin?.metadata.id],
  );
  const isUnInstalling = useMemo(
    () => unInstalling.includes(selectedPlugin?.metadata.id || ''),
    [unInstalling, selectedPlugin?.metadata.id],
  );

  const [isCompatible, setIsCompatible] = useState<boolean>(true);
  const [isSecOpen, setIsSecOpen] = useState<boolean>(false);

  useEffect(() => {
    applicationIpc.invoke.getSystemInfo().then(result => {
      setIsCompatible(selectedPlugin?.versions.some(v => v.platforms.includes(result.os)) || false);
    });
  }, [selectedPlugin]);

  const installExtension = useCallback(() => {
    AddBreadcrumb_Renderer(`Plugin install: id:${selectedPlugin?.metadata.id}`);
    dispatch(pluginsActions.manageSet({key: 'installing', id: selectedPlugin?.metadata.id, operation: 'add'}));

    if (selectedPlugin?.url) {
      const targetVersion = selectedPlugin.versions.find(v => v.version === currentVersion);
      pluginsIpc.install(selectedPlugin.url, targetVersion?.commit).then(result => {
        dispatch(pluginsActions.manageSet({key: 'installing', id: selectedPlugin?.metadata.id, operation: 'remove'}));
        if (result) {
          lynxTopToast(dispatch).success(`${selectedPlugin.metadata.title} installed successfully`);
          showRestartModal(dispatch, 'To apply the installation, please restart the app.');
          if (targetVersion) {
            dispatch(
              pluginsActions.addInstalled({
                version: targetVersion.version,
                url: selectedPlugin.url,
                id: selectedPlugin.metadata.id,
              }),
            );
          }
        }
      });
    }
  }, [selectedPlugin, currentVersion, dispatch]);

  const uninstallExtension = useCallback(() => {
    AddBreadcrumb_Renderer(`Plugin uninstall: id:${selectedPlugin?.metadata.id}`);
    dispatch(pluginsActions.manageSet({key: 'unInstalling', id: selectedPlugin?.metadata.id, operation: 'add'}));

    if (selectedPlugin?.metadata.id) {
      pluginsIpc.uninstall(selectedPlugin.metadata.id).then(result => {
        dispatch(pluginsActions.manageSet({key: 'unInstalling', id: selectedPlugin?.metadata.id, operation: 'remove'}));
        if (result) {
          lynxTopToast(dispatch).success(`${selectedPlugin.metadata.title} uninstalled successfully`);
          showRestartModal(dispatch, 'To complete the uninstallation, please restart the app.');
          dispatch(pluginsActions.removeInstalled(selectedPlugin.metadata.id));
        }
      });
    }
  }, [selectedPlugin]);

  const handleInstall = () => {
    AddBreadcrumb_Renderer(`Plugin handleInstall: id:${selectedPlugin?.metadata.id}`);
    setIsSecOpen(true);
  };

  return (
    <div className="flex flex-col gap-y-1 items-end">
      <SecurityWarning
        type="extension"
        tabId={activeTab}
        isOpen={isSecOpen}
        setIsOpen={setIsSecOpen}
        onAgree={installExtension}
        title={selectedPlugin?.metadata.title}
        owner={extractGitUrl(selectedPlugin?.url || '').owner}
      />
      {isModule && installed && <ModuleConfigModal isOpen={configModal.isOpen} onClose={configModal.onClose} />}
      {installed && <Versions currentVersion={currentVersion} />}
      <div className="flex flex-row items-center gap-x-2">
        {isModule && installed && (
          <Button
            size="sm"
            variant="flat"
            color="secondary"
            onPress={configModal.onOpen}
            startContent={<SettingsMinimalistic />}>
            Configure
          </Button>
        )}
        <UpdateButton item={selectedPlugin!} />
        {installed ? (
          <Button
            size="sm"
            color="danger"
            variant="flat"
            isLoading={isUnInstalling}
            onPress={uninstallExtension}
            startContent={!isUnInstalling && <TrashBin2 />}>
            {isUnInstalling ? 'Uninstalling...' : 'Uninstall'}
          </Button>
        ) : (
          <Button
            size="sm"
            onPress={handleInstall}
            isLoading={isInstalling}
            isDisabled={!isCompatible}
            color={isCompatible ? 'success' : 'warning'}
            startContent={!isInstalling && <DownloadMinimalistic />}>
            {!isCompatible ? 'Not Compatible' : isInstalling ? 'Installing...' : 'Install'}
          </Button>
        )}
      </div>
    </div>
  );
}
