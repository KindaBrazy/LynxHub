import {Button, Card, CardBody, CardFooter, CardHeader, Chip, Link, Tooltip, User} from '@heroui/react';
import {Typography} from 'antd';
import {Dispatch, SetStateAction, useMemo} from 'react';

import {extractGitUrl} from '../../../../../../../../cross/CrossUtils';
import {SkippedPlugins} from '../../../../../../../../cross/IpcChannelAndTypes';
import {getTargetVersion} from '../../../../../../../../cross/plugin/CrossPluginUtils';
import {InstalledPlugin, PluginItem} from '../../../../../../../../cross/plugin/PluginTypes';
import AddBreadcrumb_Renderer from '../../../../../../../Breadcrumbs';
import {
  ArrowDuo_Icon,
  CheckDuo_Icon,
  Linux_Icon,
  MacOS_Icon,
  ShieldWarning_Icon,
  Windows_Icon,
} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {useSettingsState} from '../../../../../Redux/Reducer/SettingsReducer';
import {useUserState} from '../../../../../Redux/Reducer/UserReducer';
import {UpdateButton} from '../Elements';
import {useExtensionPageStore} from '../Page';

type Props = {
  item: PluginItem;
  selectedExt: PluginItem | undefined;
  setSelectedExt: Dispatch<SetStateAction<PluginItem | undefined>>;
  installed: InstalledPlugin[];
  unloaded: SkippedPlugins[];
};

export function List_Item({item, selectedExt, setSelectedExt, installed, unloaded}: Props) {
  const updateAvailable = useSettingsState('pluginUpdateAvailableList');
  const updateChannel = useUserState('updateChannel');

  const isInstalling = useExtensionPageStore(state => state.installing.has(item.metadata.id));
  const isUnInstalling = useExtensionPageStore(state => state.unInstalling.has(item.metadata.id));

  const isSelected = useMemo(() => selectedExt?.metadata.id === item.metadata.id, [selectedExt, item.metadata.id]);

  const {isExtension, foundInstalled, foundUnloaded, win32, darwin, linux} = useMemo(() => {
    const isExtension = item.metadata.type === 'extension';

    const foundInstalled = installed.find(i => i.metadata.id === item.metadata.id);
    const foundUnloaded = unloaded.find(u => foundInstalled?.dir === u.folderName);

    const {linux, win32, darwin} = {
      linux: item.versions.some(v => v.platforms.includes('linux')),
      win32: item.versions.some(v => v.platforms.includes('win32')),
      darwin: item.versions.some(v => v.platforms.includes('darwin')),
    };

    return {
      isInstalling,
      isExtension,
      foundInstalled,
      foundUnloaded,
      linux,
      win32,
      darwin,
    };
  }, [item, installed, unloaded]);

  const currentVersion = useMemo(() => {
    const targetInstallVersion = getTargetVersion(item.versions, updateChannel);
    const currentVersion = foundInstalled?.version.version || targetInstallVersion.version;

    return currentVersion;
  }, [item.versions, updateChannel, foundInstalled]);

  const {targetUpdate, targetVersion, isUpgrade} = useMemo(() => {
    const targetUpdate = updateAvailable.find(update => update.id === item.metadata.id);
    const isUpgrade = targetUpdate?.type === 'upgrade';
    const targetVersion = targetUpdate?.version.version;

    return {
      targetUpdate,
      isUpgrade,
      targetVersion,
    };
  }, [updateAvailable, item.metadata.id]);

  return (
    <Card
      onPress={() => {
        AddBreadcrumb_Renderer(`Plugin Select: id:${item.metadata.id}`);
        setSelectedExt(item);
      }}
      className={
        `hover:bg-foreground-100 hover:shadow-medium relative border-2 ` +
        ` border-foreground-100 ${isSelected && (isExtension ? '!border-primary' : '!border-secondary')}` +
        ` rounded-xl !transition-all !duration-300 bg-foreground-50 cursor-default`
      }
      as="div"
      shadow="sm"
      key={`${item.metadata.id}_plugin_list_item`}
      fullWidth
      isPressable>
      <CardHeader className="pb-0">
        <User
          avatarProps={{
            src: item.icon,
            radius: 'none',
            className: 'shrink-0 !bg-black/0',
          }}
          description={
            <span className="text-foreground-500 text-small">
              By <span className="font-bold text-foreground-500">{extractGitUrl(item.url).owner}</span>
            </span>
          }
          name={
            <div className="space-x-2">
              <Link
                className={
                  `${isExtension ? 'text-primary-500' : 'text-secondary-500'}` +
                  ` transition-colors duration-300 font-semibold`
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
        <Typography.Paragraph className="mt-2" ellipsis={{rows: 2, tooltip: true}}>
          {item.metadata.description}
        </Typography.Paragraph>
      </CardBody>

      <CardFooter className="flex flex-row items-center gap-x-2 pl-[3.7rem] pt-0 justify-between">
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

        <UpdateButton item={item} selectedItem={selectedExt} />

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
      </CardFooter>
    </Card>
  );
}
