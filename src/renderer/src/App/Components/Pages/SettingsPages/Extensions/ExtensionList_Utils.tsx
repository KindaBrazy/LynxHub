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
import {Modal, Typography} from 'antd';
import {isEmpty, isNil} from 'lodash';
import {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extractGitUrl} from '../../../../../../../cross/CrossUtils';
import {SkippedPlugins} from '../../../../../../../cross/IpcChannelAndTypes';
import {InstalledPlugin, PluginAvailableItem} from '../../../../../../../cross/plugin/PluginTypes';
import AddBreadcrumb_Renderer from '../../../../../../Breadcrumbs';
import {
  CheckDuo_Icon,
  Download_Icon,
  FilterDuo_Icon,
  Linux_Icon,
  MacOS_Icon,
  ShieldWarning_Icon,
  Windows_Icon,
} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {useSettingsState} from '../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import {isLinuxPortable, lynxTopToast} from '../../../../Utils/UtilHooks';
import {ExtFilter} from './ExtensionList';
import {useExtensionPageStore} from './ExtensionsPage';

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
  selectedFilters: ExtFilter,
  setSelectedExt: Dispatch<SetStateAction<PluginAvailableItem | undefined>>,
  installed: string[],
) {
  const filteredList = useMemo(() => {
    if (selectedFilters === 'all' || selectedFilters.size === 4) return list;

    const isInstalledFilterActive = selectedFilters.has('installed');
    return list.filter(item => {
      const isInstalled = installed.includes(item.metadata.id);

      if (!isInstalledFilterActive) return !isInstalled;

      return isInstalled;
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

export function useFilterMenu(selectedKeys: ExtFilter, setSelectedKeys: Dispatch<SetStateAction<ExtFilter>>) {
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
              <DropdownItem key="feature" className="cursor-default">
                Feature
              </DropdownItem>
              <DropdownItem key="tools" className="cursor-default">
                Tools
              </DropdownItem>
              <DropdownItem key="games" className="cursor-default">
                Games
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

  const manageSet = useExtensionPageStore(state => state.manageSet);

  const installing = useExtensionPageStore(state => state.installing);
  const updating = useExtensionPageStore(state => state.updating);
  const unInstalling = useExtensionPageStore(state => state.unInstalling);

  const dispatch = useDispatch<AppDispatch>();

  const later = useCallback(() => {
    Modal.destroyAll();
  }, []);

  const restart = useCallback(() => {
    Modal.destroyAll();
    rendererIpc.win.changeWinState('restart');
  }, []);

  const close = useCallback(() => {
    Modal.destroyAll();
    rendererIpc.win.changeWinState('close');
  }, []);

  const showRestartModal = useCallback((message: string) => {
    Modal.warning({
      title: 'Restart Required',
      content: message,
      footer: (
        <div className="mt-6 flex w-full flex-row justify-between">
          <Button size="sm" variant="flat" color="warning" onPress={later}>
            Restart Later
          </Button>
          <Button size="sm" color="success" onPress={isLinuxPortable ? close : restart}>
            {isLinuxPortable ? 'Exit Now' : 'Restart Now'}
          </Button>
        </div>
      ),
      centered: true,
      maskClosable: false,
      rootClassName: 'scrollbar-hide',
      styles: {mask: {top: '2.5rem'}},
      wrapClassName: 'mt-10',
    });
  }, []);

  const update = useCallback(
    (id: string, title: string) => {
      AddBreadcrumb_Renderer(`Extension update: id:${id}`);
      manageSet('updating', selectedExt?.metadata.id, 'add');
      rendererIpc.plugins.updatePlugin(id).then(updated => {
        if (updated) {
          lynxTopToast(dispatch).success(`${title} updated Successfully`);
          showRestartModal('To apply the updates to the extension, please restart the app.');
        }
        manageSet('updating', selectedExt?.metadata.id, 'remove');
      });
    },
    [selectedExt],
  );

  return useCallback(
    (item: PluginAvailableItem) => {
      const isExtension = item.metadata.type === 'extension';
      const isItemSelected = selectedExt?.metadata.id === item.metadata.id;

      const foundInstalled = installed.find(i => i.metadata.id === item.metadata.id);
      const foundUnloaded = unloaded.find(u => foundInstalled?.dir === u.folderName);

      const isInstalling = installing.has(item.metadata.id);
      const isUpdating = updating.has(item.metadata.id);
      const isUnInstalling = unInstalling.has(item.metadata.id);

      const isUpdateAvailable = updateAvailable.some(available => available.id === item.metadata.id);

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
                    className={`${
                      updateAvailable.some(available => available.id === item.metadata.id) && 'text-success'
                    }`}
                    size="sm"
                    radius="sm"
                    variant="flat">
                    v{foundInstalled?.version.version || item.versioning.versions[0].version}
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

            {isUpdateAvailable && (
              <Button
                size="sm"
                color="success"
                className="mr-4"
                isLoading={isUpdating}
                isDisabled={updatingAll}
                variant={isUpdating ? 'light' : 'flat'}
                startContent={!isUpdating && <Download_Icon />}
                onPress={() => update(item.metadata.id, item.metadata.title)}>
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
            )}

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
