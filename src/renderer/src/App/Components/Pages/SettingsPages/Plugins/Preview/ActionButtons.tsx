import {Button} from '@heroui/react';
import {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extractGitUrl} from '../../../../../../../../cross/CrossUtils';
import {InstalledPlugin, PluginUpdateList} from '../../../../../../../../cross/plugin/PluginTypes';
import AddBreadcrumb_Renderer from '../../../../../../../Breadcrumbs';
import {Download2_Icon, Trash_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {lynxTopToast} from '../../../../../Utils/UtilHooks';
import SecurityWarning from '../../SecurityWarning';
import {ShowRestartModal, UpdateButton} from '../Elements';
import {useExtensionPageStore} from '../Page';
import Versions from './Versions';

type Props = {
  installed: boolean;
  setInstalled: Dispatch<SetStateAction<InstalledPlugin[]>>;
  targetUpdate: PluginUpdateList | undefined;
  currentVersion: string;
};

export default function ActionButtons({installed, setInstalled, targetUpdate, currentVersion}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const selectedPlugin = useExtensionPageStore(state => state.selectedPlugin);
  const manageSet = useExtensionPageStore(state => state.manageSet);
  const installing = useExtensionPageStore(state => state.installing);
  const unInstalling = useExtensionPageStore(state => state.unInstalling);

  const isInstalling = useMemo(
    () => installing.has(selectedPlugin?.metadata.id || ''),
    [installing, selectedPlugin?.metadata.id],
  );
  const isUnInstalling = useMemo(
    () => unInstalling.has(selectedPlugin?.metadata.id || ''),
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
    manageSet('installing', selectedPlugin?.metadata.id, 'add');

    if (selectedPlugin?.url) {
      const targetCommit = selectedPlugin.versions.find(v => v.version === currentVersion)?.commit;
      rendererIpc.plugins.installPlugin(selectedPlugin.url, targetCommit).then(result => {
        manageSet('installing', selectedPlugin?.metadata.id, 'remove');
        if (result) {
          lynxTopToast(dispatch).success(`${selectedPlugin.metadata.title} installed successfully`);
          ShowRestartModal('To apply the installaion, please restart the app.');
          setInstalled(prevState => [
            ...prevState,
            {
              version: {...selectedPlugin.versions[0], engines: {extensionApi: ''}},
              metadata: selectedPlugin.metadata,
              url: selectedPlugin.url,
              dir: '',
            },
          ]);
        }
      });
    }
  }, [selectedPlugin]);

  const uninstallExtension = useCallback(() => {
    AddBreadcrumb_Renderer(`Plugin uninstall: id:${selectedPlugin?.metadata.id}`);
    manageSet('unInstalling', selectedPlugin?.metadata.id, 'add');

    if (selectedPlugin?.metadata.id) {
      rendererIpc.plugins.uninstallPlugin(selectedPlugin.metadata.id).then(result => {
        manageSet('unInstalling', selectedPlugin?.metadata.id, 'remove');
        if (result) {
          lynxTopToast(dispatch).success(`${selectedPlugin.metadata.title} uninstalled successfully`);
          ShowRestartModal('To complete the uninstallation, please restart the app.');
        }
        setInstalled(prevState => prevState.filter(item => item.metadata.id !== selectedPlugin.metadata.id));
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
      <Versions targetUpdate={targetUpdate} currentVersion={currentVersion} />
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
