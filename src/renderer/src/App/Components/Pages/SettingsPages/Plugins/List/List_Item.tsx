import {Button, Card, CardBody, CardFooter, CardHeader, Chip, Link, Progress, Tooltip, User} from '@heroui/react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';
import {SimpleGitProgressEvent} from 'simple-git';

import {extractGitUrl} from '../../../../../../../../cross/CrossUtils';
import {getPluginIconUrl} from '../../../../../../../../cross/plugin/CrossPluginUtils';
import {PluginInstalledItem, PluginItem} from '../../../../../../../../cross/plugin/PluginTypes';
import AddBreadcrumb_Renderer from '../../../../../../../Breadcrumbs';
import {
  ArrowDuo_Icon,
  CheckDuo_Icon,
  Linux_Icon,
  MacOS_Icon,
  QuestionCircle_Icon,
  ShieldWarning_Icon,
  TrashDuo_Icon,
  Windows_Icon,
} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {
  pluginsActions,
  useIsInstallingPlugin,
  useIsUninstallingPlugin,
  usePluginsState,
} from '../../../../../Redux/Reducer/PluginsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {lynxTopToast} from '../../../../../Utils/UtilHooks';
import {ShowRestartModal, UpdateButton} from '../Elements';

type Props = {item: PluginItem; installed: PluginInstalledItem[]};
export function List_Item({item, installed}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const selectedPlugin = usePluginsState('selectedPlugin');
  const skipped = usePluginsState('unloadedList');
  const isInstalling = useIsInstallingPlugin(item.metadata.id);
  const isUnInstalling = useIsUninstallingPlugin(item.metadata.id);

  const syncList = usePluginsState('syncList');

  const isSelected = useMemo(
    () => selectedPlugin?.metadata.id === item.metadata.id,
    [selectedPlugin, item.metadata.id],
  );

  const {isExtension, foundInstalled, foundUnloaded, win32, darwin, linux, isCompatible} = useMemo(() => {
    const isExtension = item.metadata.type === 'extension';
    const isCompatible = item.isCompatible;

    const foundInstalled = installed.find(i => i.id === item.metadata.id);
    const foundUnloaded = skipped.find(u => foundInstalled?.id === u.id);

    const {linux, win32, darwin} = {
      linux: item.versions.some(v => v.platforms.includes('linux')),
      win32: item.versions.some(v => v.platforms.includes('win32')),
      darwin: item.versions.some(v => v.platforms.includes('darwin')),
    };

    return {
      isExtension,
      foundInstalled,
      foundUnloaded,
      linux,
      win32,
      darwin,
      isCompatible,
    };
  }, [item, installed, skipped]);

  const currentVersion = useMemo(() => {
    const targetInstallVersion = item.versions.find(item => item.isCompatible);

    let v: string = 'N/A';

    if (foundInstalled) {
      v = foundInstalled.version;
    } else if (targetInstallVersion) {
      v = targetInstallVersion.version;
    }

    return v;
  }, [item.versions, foundInstalled]);

  const {targetUpdate, targetVersion, isUpgrade} = useMemo(() => {
    const targetUpdate = syncList.find(update => update.id === item.metadata.id);
    const isUpgrade = targetUpdate?.type === 'upgrade';
    const targetVersion = targetUpdate?.version;

    return {
      targetUpdate,
      isUpgrade,
      targetVersion,
    };
  }, [syncList, item.metadata.id]);

  const uninstall = useCallback(() => {
    rendererIpc.plugins.uninstall(item.metadata.id).then(result => {
      if (result) {
        lynxTopToast(dispatch).success(`${item.metadata.title} uninstalled successfully`);
        ShowRestartModal('To complete the uninstallation, please restart the app.');
        dispatch(pluginsActions.removeInstalled(item.metadata.id));
      }
    });
  }, [item]);

  return (
    <Card
      onPress={() => {
        AddBreadcrumb_Renderer(`Plugin Select: id:${item.metadata.id}`);
        dispatch(pluginsActions.setSelectedPlugin(item));
      }}
      className={
        `hover:bg-foreground-100 hover:shadow-medium relative border-2 ` +
        ` border-foreground-100 ${isSelected && (isExtension ? '!border-primary' : '!border-secondary')}` +
        ` rounded-xl !transition-all !duration-300 bg-foreground-50`
      }
      as="div"
      shadow="sm"
      isPressable={isCompatible}
      key={`${item.metadata.id}_plugin_list_item`}
      fullWidth>
      {!isCompatible && (
        <div className="absolute inset-0 z-20 gap-y-1 bg-black/50 flex flex-col items-center justify-center">
          <Tooltip
            delay={300}
            color="warning"
            content={item.incompatibleReason}
            classNames={{content: 'p-2 whitespace-pre'}}
            showArrow>
            <QuestionCircle_Icon
              className={
                'size-10 text-warning/80 hover:text-warning transition-colors' +
                ' duration-200 p-1 bg-background/80 rounded-full'
              }
            />
          </Tooltip>
          <span className="text-sm px-2 py-1 bg-background/80 rounded-lg">Incompatible</span>
          {foundInstalled && (
            <div className="absolute top-2 right-2 p-1 bg-background/80 rounded-lg">
              <Button size="sm" variant="flat" color="danger" onPress={uninstall} isIconOnly>
                <TrashDuo_Icon className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      <CardHeader className="pb-0">
        <User
          avatarProps={{
            src: getPluginIconUrl(item.url),
            radius: 'none',
            className: 'shrink-0 !bg-black/0',
          }}
          description={
            <span className="text-foreground-500 text-xs">
              By <span className="font-bold text-foreground-500">{extractGitUrl(item.url).owner}</span>
            </span>
          }
          name={
            <div className="space-x-2">
              <Link
                className={
                  `${isExtension ? 'text-primary-500' : 'text-secondary-500'}` +
                  ` transition-colors duration-300 font-semibold `
                }
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
                    <ArrowDuo_Icon className="size-3 rotate-180" />
                    <span className={`${isUpgrade ? 'text-success' : 'text-warning'}`}>v{targetVersion}</span>
                  </>
                )}
              </Chip>
            </div>
          }
          className="justify-start mt-2"
        />
      </CardHeader>

      <CardBody className="pl-[3.7rem] py-0">
        <span className="mb-1.5 mt-1 text-xs text-foreground-700 line-clamp-3">{item.metadata.description}</span>
      </CardBody>

      <CardFooter className="flex flex-row items-center gap-x-2 pt-0 justify-between">
        <div className="flex flex-row items-center px-0 gap-x-1">
          {linux && <Linux_Icon className="size-4" />}
          {win32 && <Windows_Icon className="size-4" />}
          {darwin && <MacOS_Icon className="size-4" />}

          {foundInstalled && (
            <Chip
              size="sm"
              radius="sm"
              variant="flat"
              color="primary"
              className="ml-2"
              startContent={<CheckDuo_Icon />}>
              Installed
            </Chip>
          )}

          {foundUnloaded && (
            <Tooltip
              delay={300}
              radius="sm"
              color="warning"
              className="py-2 px-4"
              content={foundUnloaded.message}
              showArrow>
              <Chip
                size="sm"
                radius="sm"
                variant="flat"
                color="warning"
                startContent={<ShieldWarning_Icon className="size-3.5" />}>
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

type InstallProps = {isInstalling: boolean; pluginUrl: string};
function InstallProgress({isInstalling, pluginUrl}: InstallProps) {
  const [installProgress, setInstallProgress] = useState<number>(0);

  useEffect(() => {
    const removeListener = rendererIpc.git.onProgress((_, url, state, result) => {
      if (url === pluginUrl) {
        switch (state) {
          case 'Progress':
            setInstallProgress((result as SimpleGitProgressEvent).progress);
            break;
          case 'Failed':
            setInstallProgress(0);
            break;
          case 'Completed':
            setInstallProgress(0);
            break;
        }
      }
    });

    return () => removeListener();
  }, [pluginUrl, setInstallProgress]);

  if (!isInstalling) return null;

  return <Progress size="sm" color="success" value={installProgress} className="absolute bottom-0 inset-x-0" />;
}
