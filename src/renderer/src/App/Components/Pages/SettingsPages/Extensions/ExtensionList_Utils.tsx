import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Link,
  Tooltip,
  User,
} from '@heroui/react';
import {Typography} from 'antd';
import {isEmpty, isNil} from 'lodash';
import {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';

import {extractGitUrl} from '../../../../../../../cross/CrossUtils';
import {SkippedPlugins} from '../../../../../../../cross/IpcChannelAndTypes';
import {InstalledPlugin, PluginAvailableItem, PluginFilter} from '../../../../../../../cross/plugin/PluginTypes';
import AddBreadcrumb_Renderer from '../../../../../../Breadcrumbs';
import {
  ArrowDuo_Icon,
  CheckDuo_Icon,
  FilterDuo_Icon,
  Linux_Icon,
  MacOS_Icon,
  ShieldWarning_Icon,
  Windows_Icon,
} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {useSettingsState} from '../../../../Redux/Reducer/SettingsReducer';
import rendererIpc from '../../../../RendererIpc';
import {useExtensionPageStore} from './ExtensionsPage';
import {UpdateButton} from './PluginElements';

export function useFetchExtensions(setList: Dispatch<SetStateAction<PluginAvailableItem[]>>) {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    async function fetchExtensionsList() {
      setLoading(true);
      try {
        const plugins = await rendererIpc.statics.getPluginsList();

        if (!isEmpty(plugins)) setList(plugins);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    setRefreshing(true);
    rendererIpc.statics.pull().finally(() => fetchExtensionsList().finally(() => setRefreshing(false)));

    fetchExtensionsList();
  }, []);

  return {loading, refreshing};
}

export function useFilteredList(
  list: PluginAvailableItem[],
  selectedFilters: PluginFilter,
  setSelectedExt: Dispatch<SetStateAction<PluginAvailableItem | undefined>>,
  installed: string[],
) {
  const filteredList = useMemo(() => {
    if (selectedFilters === 'all' || selectedFilters.size === 3) return list;

    const isInstalledActive = selectedFilters.has('installed');
    const isModuleActive = selectedFilters.has('modules');
    const isExtensionActive = selectedFilters.has('extensions');

    return list.filter(item => {
      const isInstalled = installed.includes(item.metadata.id);
      const isModule = item.metadata.type === 'module';
      const isExtension = item.metadata.type === 'extension';

      return (isInstalledActive && isInstalled) || (isModuleActive && isModule) || (isExtensionActive && isExtension);
    });
  }, [list, selectedFilters, installed]);

  useEffect(() => {
    setSelectedExt(prevState => {
      if (isEmpty(filteredList)) {
        return undefined;
      }
      if (isNil(prevState)) {
        return filteredList[0];
      }
      if (!filteredList.some(item => item.metadata.id === prevState.metadata.id)) {
        return filteredList[0];
      }
      return prevState;
    });
  }, [filteredList]);

  return filteredList;
}

export function useSortedList(list: PluginAvailableItem[], installed: string[]) {
  return useMemo(
    () =>
      [...list].sort((a, b) => {
        const aInstalled = installed.includes(a.metadata.id);
        const bInstalled = installed.includes(b.metadata.id);

        if (aInstalled && !bInstalled) return -1;
        if (!aInstalled && bInstalled) return 1;
        return 0;
      }),
    [list, installed],
  );
}

export function useFilterMenu(selectedKeys: PluginFilter, setSelectedKeys: Dispatch<SetStateAction<PluginFilter>>) {
  return useCallback(() => {
    return (
      <>
        <Dropdown size="sm" closeOnSelect={false} className="border !border-foreground/15">
          <DropdownTrigger>
            <Button variant="flat" isIconOnly>
              <FilterDuo_Icon className="size-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            variant="faded"
            selectionMode="multiple"
            selectedKeys={selectedKeys}
            // @ts-ignore-next-line
            onSelectionChange={setSelectedKeys}>
            <DropdownSection title="Filter">
              <DropdownItem key="installed" className="cursor-default">
                Installed
              </DropdownItem>
              <DropdownItem key="modules" className="cursor-default">
                Modules
              </DropdownItem>
              <DropdownItem key="extensions" className="cursor-default">
                Extensions
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </>
    );
  }, [selectedKeys]);
}

export function useRenderList(
  selectedExt: PluginAvailableItem | undefined,
  setSelectedExt: Dispatch<SetStateAction<PluginAvailableItem | undefined>>,
  isLoaded: boolean,
  installed: InstalledPlugin[],
  unloaded: SkippedPlugins[],
  updatingAll: boolean,
) {
  const updateAvailable = useSettingsState('pluginUpdateAvailableList');

  const installing = useExtensionPageStore(state => state.installing);
  const updating = useExtensionPageStore(state => state.updating);
  const unInstalling = useExtensionPageStore(state => state.unInstalling);

  return useCallback(
    (item: PluginAvailableItem) => {
      const isExtension = item.metadata.type === 'extension';
      const isItemSelected = selectedExt?.metadata.id === item.metadata.id;

      const foundInstalled = installed.find(i => i.metadata.id === item.metadata.id);
      const foundUnloaded = unloaded.find(u => foundInstalled?.dir === u.folderName);

      const isInstalling = installing.has(item.metadata.id);
      const isUnInstalling = unInstalling.has(item.metadata.id);

      const currentVersion = foundInstalled?.version.version || item.versioning.versions[0].version;
      const targetUpdate = updateAvailable.find(update => update.id === item.metadata.id);
      const isUpgrade = targetUpdate?.type === 'upgrade';
      const targetVersion = targetUpdate?.version.version;

      const {linux, win32, darwin} = {
        linux: item.metadata.platforms?.includes('linux'),
        win32: item.metadata.platforms?.includes('win32'),
        darwin: item.metadata.platforms?.includes('darwin'),
      };

      return (
        <Card
          onPress={() => {
            AddBreadcrumb_Renderer(`Extension Select: id:${item.metadata.id}`);
            setSelectedExt(item);
          }}
          className={
            `hover:bg-foreground-100 hover:shadow-medium relative border-2 ` +
            ` border-foreground-100 ${isItemSelected && (isExtension ? '!border-primary' : '!border-secondary')}` +
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
    },
    [installed, selectedExt, isLoaded, unloaded, updatingAll, updateAvailable, installing, updating, unInstalling],
  );
}
