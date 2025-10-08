import {Button} from '@heroui/react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extractGitUrl} from '../../../../../../../../cross/CrossUtils';
import AddBreadcrumb_Renderer from '../../../../../../../Breadcrumbs';
import {Download2_Icon, Trash_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {pluginsActions, usePluginsState} from '../../../../../Redux/Reducer/PluginsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {lynxTopToast} from '../../../../../Utils/UtilHooks';
import SecurityWarning from '../../SecurityWarning';
import {ShowRestartModal, UpdateButton} from '../Elements';
import Versions from './Versions';

type Props = {installed: boolean; currentVersion: string};
export default function ActionButtons({installed, currentVersion}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const selectedPlugin = usePluginsState('selectedPlugin');
  const installing = usePluginsState('installing');
  const unInstalling = usePluginsState('unInstalling');

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
    rendererIpc.win.getSystemInfo().then(result => {
      setIsCompatible(selectedPlugin?.versions.some(v => v.platforms.includes(result.os)) || false);
    });
  }, [selectedPlugin]);

  const installExtension = useCallback(() => {
    AddBreadcrumb_Renderer(`Plugin install: id:${selectedPlugin?.metadata.id}`);
    dispatch(pluginsActions.manageSet({key: 'installing', id: selectedPlugin?.metadata.id, operation: 'add'}));

    if (selectedPlugin?.url) {
      const targetVersion = selectedPlugin.versions.find(v => v.version === currentVersion);
      rendererIpc.plugins.install(selectedPlugin.url, targetVersion?.commit).then(result => {
        dispatch(pluginsActions.manageSet({key: 'installing', id: selectedPlugin?.metadata.id, operation: 'remove'}));
        if (result) {
          lynxTopToast(dispatch).success(`${selectedPlugin.metadata.title} installed successfully`);
          ShowRestartModal('To apply the installation, please restart the app.');
          if (targetVersion) {
            dispatch(
              pluginsActions.addInstalled({
                version: targetVersion.version,
                url: selectedPlugin.url,
                id: '',
              }),
            );
          }
        }
      });
    }
  }, [selectedPlugin]);

  const uninstallExtension = useCallback(() => {
    AddBreadcrumb_Renderer(`Plugin uninstall: id:${selectedPlugin?.metadata.id}`);
    dispatch(pluginsActions.manageSet({key: 'unInstalling', id: selectedPlugin?.metadata.id, operation: 'add'}));

    if (selectedPlugin?.metadata.id) {
      rendererIpc.plugins.uninstall(selectedPlugin.metadata.id).then(result => {
        dispatch(pluginsActions.manageSet({key: 'unInstalling', id: selectedPlugin?.metadata.id, operation: 'remove'}));
        if (result) {
          lynxTopToast(dispatch).success(`${selectedPlugin.metadata.title} uninstalled successfully`);
          ShowRestartModal('To complete the uninstallation, please restart the app.');
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
        isOpen={isSecOpen}
        setIsOpen={setIsSecOpen}
        onAgree={installExtension}
        title={selectedPlugin?.metadata.title}
        owner={extractGitUrl(selectedPlugin?.url || '').owner}
      />
      <Versions currentVersion={currentVersion} />
      <div className="flex flex-row items-center gap-x-2">
        <UpdateButton item={selectedPlugin!} />
        {installed ? (
          <Button
            size="sm"
            color="danger"
            variant="flat"
            isLoading={isUnInstalling}
            onPress={uninstallExtension}
            startContent={!isUnInstalling && <Trash_Icon />}>
            {isUnInstalling ? 'Uninstalling...' : 'Uninstall'}
          </Button>
        ) : (
          <Button
            size="sm"
            onPress={handleInstall}
            isLoading={isInstalling}
            isDisabled={!isCompatible}
            color={isCompatible ? 'success' : 'warning'}
            startContent={!isInstalling && <Download2_Icon />}>
            {!isCompatible ? 'Not Compatible' : isInstalling ? 'Installing...' : 'Install'}
          </Button>
        )}
      </div>
    </div>
  );
}
