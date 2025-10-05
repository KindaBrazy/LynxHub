import {Button} from '@heroui/react';
import {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extractGitUrl} from '../../../../../../../../cross/CrossUtils';
import {InstalledPlugin, PluginAvailableItem, PluginUpdateList} from '../../../../../../../../cross/plugin/PluginTypes';
import AddBreadcrumb_Renderer from '../../../../../../../Breadcrumbs';
import {Download2_Icon, Trash_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {lynxTopToast} from '../../../../../Utils/UtilHooks';
import SecurityWarning from '../../SecurityWarning';
import {ShowRestartModal, UpdateButton} from '../Elements';
import {useExtensionPageStore} from '../Page';
import Versions from './Versions';

export default function ActionButtons({
  installed,
  selectedExt,
  setInstalled,
  targetUpdate,
  currentVersion,
}: {
  installed: boolean;
  selectedExt: PluginAvailableItem | undefined;
  setInstalled: Dispatch<SetStateAction<InstalledPlugin[]>>;
  targetUpdate: PluginUpdateList | undefined;
  currentVersion: string;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const manageSet = useExtensionPageStore(state => state.manageSet);
  const installing = useExtensionPageStore(state => state.installing);
  const unInstalling = useExtensionPageStore(state => state.unInstalling);

  const isInstalling = useMemo(
    () => installing.has(selectedExt?.metadata.id || ''),
    [installing, selectedExt?.metadata.id],
  );
  const isUnInstalling = useMemo(
    () => unInstalling.has(selectedExt?.metadata.id || ''),
    [unInstalling, selectedExt?.metadata.id],
  );

  const [isCompatible, setIsCompatible] = useState<boolean>(true);
  const [isSecOpen, setIsSecOpen] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.win.getSystemInfo().then(result => {
      setIsCompatible(selectedExt?.versioning.versions.some(v => v.platforms.includes(result.os)) || false);
    });
  }, [selectedExt]);

  const installExtension = useCallback(() => {
    AddBreadcrumb_Renderer(`Extension install: id:${selectedExt?.metadata.id}`);
    manageSet('installing', selectedExt?.metadata.id, 'add');

    if (selectedExt?.url) {
      rendererIpc.plugins.installPlugin(selectedExt.url).then(result => {
        manageSet('installing', selectedExt?.metadata.id, 'remove');
        if (result) {
          lynxTopToast(dispatch).success(`${selectedExt.metadata.title} installed successfully`);
          ShowRestartModal('To apply the installed extension, please restart the app.');
          setInstalled(prevState => [
            ...prevState,
            {
              version: selectedExt.versioning.versions[0],
              metadata: selectedExt.metadata,
              url: selectedExt.url,
              dir: '',
            },
          ]);
        }
      });
    }
  }, [selectedExt]);

  const uninstallExtension = useCallback(() => {
    AddBreadcrumb_Renderer(`Extension uninstall: id:${selectedExt?.metadata.id}`);
    manageSet('unInstalling', selectedExt?.metadata.id, 'add');

    if (selectedExt?.metadata.id) {
      rendererIpc.plugins.uninstallPlugin(selectedExt.metadata.id).then(result => {
        manageSet('unInstalling', selectedExt?.metadata.id, 'remove');
        if (result) {
          lynxTopToast(dispatch).success(`${selectedExt.metadata.title} uninstalled successfully`);
          ShowRestartModal('To complete the uninstallation of the extension, please restart the app.');
        }
        setInstalled(prevState => prevState.filter(item => item.metadata.id !== selectedExt.metadata.id));
      });
    }
  }, [selectedExt]);

  const handleInstall = () => {
    AddBreadcrumb_Renderer(`Extension handleInstall: id:${selectedExt?.metadata.id}`);
    setIsSecOpen(true);
  };

  return (
    <div className="flex flex-col gap-y-1 items-end">
      <SecurityWarning
        type="extension"
        isOpen={isSecOpen}
        setIsOpen={setIsSecOpen}
        onAgree={installExtension}
        title={selectedExt?.metadata.title}
        owner={extractGitUrl(selectedExt?.url || '').owner}
      />
      <Versions selectedExt={selectedExt} targetUpdate={targetUpdate} currentVersion={currentVersion} />
      <div className="flex flex-row items-center gap-x-2">
        <UpdateButton item={selectedExt!} selectedItem={selectedExt} />
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
