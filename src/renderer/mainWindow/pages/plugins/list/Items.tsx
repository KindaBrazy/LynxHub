import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Link,
  Progress,
  Tooltip,
  useDisclosure,
  User,
} from '@heroui/react';
import {
  pluginsActions,
  useIsInstallingPlugin,
  useIsUninstallingPlugin,
  usePluginsState,
} from '@lynx/redux/reducers/plugins';
import {AppDispatch} from '@lynx/redux/store';
import {showRestartModal} from '@lynx/utils';
import {lynxTopToast} from '@lynx/utils/hooks';
import {Linux_Icon, MacOS_Icon, Windows_Icon} from '@lynx_assets/icons';
import {PluginInstalledItem, PluginItem} from '@lynx_common/types/plugins';
import {extractGitUrl, getCacheUrl} from '@lynx_common/utils';
import {getPluginIconUrl} from '@lynx_common/utils/plugins';
import gitIpc from '@lynx_shared/ipc/git';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {QuestionCircle} from '@solar-icons/react-perf/Bold';
import {SettingsMinimalistic, ShieldWarning, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {ArrowRight, Unread} from '@solar-icons/react-perf/LineDuotone';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';
import {SimpleGitProgressEvent} from 'simple-git';

import {UpdateButton} from '../Elements';
import ModuleConfigModal from '../ModuleConfigModal';

/** Props for the PluginListItem component. */
interface PluginListItemProps {
  /** The plugin item details to display. */
  item: PluginItem;
  /** The list of currently installed plugins used to check the installation state. */
  installed: PluginInstalledItem[];
}

/**
 * Renders an individual card representing a plugin (extension or module).
 * Handles the display of metadata, installation status, OS compatibility, and module configuration.
 */
export function PluginListItem({item, installed}: PluginListItemProps) {
  const dispatch = useDispatch<AppDispatch>();

  const selectedPlugin = usePluginsState('selectedPlugin');
  const skipped = usePluginsState('unloadedList');
  const syncList = usePluginsState('syncList');

  const isInstalling = useIsInstallingPlugin(item.metadata.id);
  const isUnInstalling = useIsUninstallingPlugin(item.metadata.id);

  const configModal = useDisclosure();

  const isSelected = useMemo(
    () => selectedPlugin?.metadata.id === item.metadata.id,
    [selectedPlugin, item.metadata.id],
  );

  const {isExtension, foundInstalled, foundUnloaded, win32, darwin, linux, isCompatible} = useMemo(() => {
    const isExt = item.metadata.type === 'extension';
    const compatible = item.isCompatible;

    const installedPlugin = installed.find(i => i.id === item.metadata.id);
    const unloadedPlugin = skipped.find(u => installedPlugin?.id === u.id);

    const hasLinux = item.versions.some(v => v.platforms.includes('linux'));
    const hasWin32 = item.versions.some(v => v.platforms.includes('win32'));
    const hasDarwin = item.versions.some(v => v.platforms.includes('darwin'));

    return {
      isExtension: isExt,
      foundInstalled: installedPlugin,
      foundUnloaded: unloadedPlugin,
      linux: hasLinux,
      win32: hasWin32,
      darwin: hasDarwin,
      isCompatible: compatible,
    };
  }, [item, installed, skipped]);

  const currentVersion = useMemo(() => {
    const targetInstallVersion = item.versions.find(versionItem => versionItem.isCompatible);

    if (foundInstalled) {
      return foundInstalled.version;
    }
    if (targetInstallVersion) {
      return targetInstallVersion.version;
    }

    return 'N/A';
  }, [item.versions, foundInstalled]);

  const {targetUpdate, targetVersion, isUpgrade} = useMemo(() => {
    const updateTarget = syncList.find(update => update.id === item.metadata.id);
    const upgradeState = updateTarget?.type === 'upgrade';
    const tgtVersion = updateTarget?.version;

    return {
      targetUpdate: updateTarget,
      isUpgrade: upgradeState,
      targetVersion: tgtVersion,
    };
  }, [syncList, item.metadata.id]);

  const handleUninstall = useCallback(() => {
    pluginsIpc.uninstall(item.metadata.id).then(result => {
      if (result) {
        lynxTopToast(dispatch).success(`${item.metadata.title} uninstalled successfully`);
        showRestartModal(dispatch, 'To complete the uninstallation, please restart the app.');
        dispatch(pluginsActions.removeInstalled(item.metadata.id));
      }
    });
  }, [item, dispatch]);

  const handleSelect = useCallback(() => {
    AddBreadcrumb_Renderer(`Plugin Select: id:${item.metadata.id}`);
    dispatch(pluginsActions.setSelectedPlugin(item));
  }, [dispatch, item]);

  return (
    <Card
      onPress={handleSelect}
      className={
        `relative border-2 border-foreground-100 bg-foreground-50 transition-all! duration-300!` +
        ` hover:bg-foreground-100 hover:shadow-medium` +
        ` ${isSelected && (isExtension ? 'border-primary!' : 'border-secondary!')}`
      }
      as="div"
      shadow="sm"
      isPressable={isCompatible}
      key={`${item.metadata.id}_plugin_list_item`}
      fullWidth>
      {!isCompatible && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-y-1 bg-black/50">
          <Tooltip
            delay={300}
            color="warning"
            content={item.incompatibleReason}
            classNames={{content: 'p-2 whitespace-pre'}}
            showArrow>
            <QuestionCircle
              className={
                'size-10 rounded-full bg-background/80 p-1 text-warning/80 transition-colors' +
                ' duration-200 hover:text-warning'
              }
            />
          </Tooltip>
          <span className="rounded-lg bg-background/80 px-2 py-1 text-sm">Incompatible</span>
          {foundInstalled && (
            <div className="absolute right-2 top-2 rounded-lg bg-background/80 p-1">
              <Button size="sm" variant="flat" color="danger" onPress={handleUninstall} isIconOnly>
                <TrashBin2 className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-0">
        <User
          description={
            <span className="text-xs text-foreground-500">
              By <span className="font-bold text-foreground-500">{extractGitUrl(item.url).owner}</span>
            </span>
          }
          avatarProps={{
            src: getCacheUrl(getPluginIconUrl(item.url)),
            radius: 'none',
            name: item.metadata.title,
            showFallback: true,
            className: 'shrink-0 !bg-black/0',
          }}
          name={
            <div className="space-x-2">
              <Link
                className={`font-semibold transition-colors duration-300 ${isExtension ? 'text-primary-500' : 'text-secondary-500'}`}
                size="lg"
                href={item.url}
                isExternal>
                {item.metadata.title}
              </Link>
              <Chip
                size="sm"
                radius="sm"
                variant="flat"
                classNames={{content: 'flex flex-row items-center justify-center gap-x-1'}}>
                <span>v{currentVersion}</span>
                {targetUpdate && (
                  <>
                    <ArrowRight className="size-3" />
                    <span className={`${isUpgrade ? 'text-success' : 'text-warning'}`}>v{targetVersion}</span>
                  </>
                )}
              </Chip>
            </div>
          }
          className="mt-2 justify-start"
        />
      </CardHeader>

      <CardBody className="py-0 pl-[3.7rem]">
        <span className="mb-1.5 mt-1 line-clamp-3 text-xs text-foreground-700">{item.metadata.description}</span>
      </CardBody>

      <CardFooter className="flex flex-row items-center justify-between gap-x-2 pt-0">
        <div className="flex flex-row items-center gap-x-1 px-0">
          {linux && <Linux_Icon className="size-4" />}
          {win32 && <Windows_Icon className="size-4" />}
          {darwin && <MacOS_Icon className="size-4" />}

          {foundInstalled && (
            <>
              <Chip
                size="sm"
                radius="sm"
                variant="flat"
                color="primary"
                className="ml-2"
                startContent={<Unread className="size-4" />}>
                Installed
              </Chip>
              {!isExtension && (
                <>
                  <ModuleConfigModal isOpen={configModal.isOpen} onClose={configModal.onClose} />
                  <Tooltip delay={500} content="Configure Tools">
                    <Button
                      size="sm"
                      variant="flat"
                      color="secondary"
                      onPress={configModal.onOpen}
                      className="ml-1 min-w-0 px-2"
                      isIconOnly>
                      <SettingsMinimalistic className="size-4" />
                    </Button>
                  </Tooltip>
                </>
              )}
            </>
          )}

          {foundUnloaded && (
            <Tooltip
              delay={300}
              radius="sm"
              color="warning"
              className="px-4 py-2"
              content={foundUnloaded.message}
              showArrow>
              <Chip
                size="sm"
                radius="sm"
                variant="flat"
                color="warning"
                startContent={<ShieldWarning className="size-3.5" />}>
                Unloaded
              </Chip>
            </Tooltip>
          )}
        </div>

        <UpdateButton item={item} />

        {isInstalling && (
          <Button size="sm" color="success" variant="light" className="mr-4" isLoading isDisabled>
            Installing...
          </Button>
        )}

        {isUnInstalling && (
          <Button size="sm" color="danger" variant="light" className="mr-4" isLoading isDisabled>
            Uninstalling...
          </Button>
        )}

        <InstallProgress pluginUrl={item.url} isInstalling={isInstalling} />
      </CardFooter>
    </Card>
  );
}

/** Props for the InstallProgress component. */
interface InstallProgressProps {
  /** Indicates whether the plugin is actively being installed. */
  isInstalling: boolean;
  /** The remote Git repository URL of the plugin. */
  pluginUrl: string;
}

/**
 * Renders a progress bar that listens to download progression via simple-git IPC.
 * It appears at the bottom of the card only when the plugin is being installed.
 */
function InstallProgress({isInstalling, pluginUrl}: InstallProgressProps) {
  const [installProgress, setInstallProgress] = useState<number>(0);

  useEffect(() => {
    // We only attach the event listener if an installation is actually taking place
    if (!isInstalling) return;

    let isMounted = true;

    // Attach listener via IPC
    const removeListener = gitIpc.onProgress((url, state, result) => {
      // Validate that this notification belongs to this particular plugin installation
      if (url === pluginUrl && isMounted) {
        switch (state) {
          case 'Progress':
            setInstallProgress((result as SimpleGitProgressEvent).progress);
            break;
          case 'Failed':
          case 'Completed':
            setInstallProgress(0);
            break;
        }
      }
    });

    return () => {
      isMounted = false;
      removeListener();
    };
  }, [pluginUrl, isInstalling]);

  if (!isInstalling) return null;

  return (
    <Progress
      size="sm"
      color="success"
      value={installProgress}
      aria-label="Installing progress"
      className="absolute bottom-0 inset-x-0"
    />
  );
}
