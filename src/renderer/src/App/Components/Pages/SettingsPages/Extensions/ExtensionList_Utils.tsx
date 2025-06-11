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

import {Extension_ListData} from '../../../../../../../cross/CrossTypes';
import {extractGitUrl} from '../../../../../../../cross/CrossUtils';
import {SkippedPlugins} from '../../../../../../../cross/IpcChannelAndTypes';
import {Linux_Icon, MacOS_Icon, MenuDots_Icon, Windows_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {useSettingsState} from '../../../../Redux/Reducer/SettingsReducer';
import {useUserState} from '../../../../Redux/Reducer/UserReducer';
import rendererIpc from '../../../../RendererIpc';
import {ExtFilter} from './ExtensionList';
import {InstalledExt} from './ExtensionsPage';

export function useFetchExtensions(setList: Dispatch<SetStateAction<Extension_ListData[]>>) {
  const [loading, setLoading] = useState<boolean>(true);
  const userData = useUserState('patreonUserData');

  useEffect(() => {
    async function fetchExtensionsList() {
      setLoading(true);
      try {
        const ipc = userData.earlyAccess ? rendererIpc.statics.getExtensionsEA : rendererIpc.statics.getExtensions;
        const extensions = await ipc();

        const data: Extension_ListData[] = extensions.map(ext => {
          const {id, repoUrl, title, description, avatarUrl, updateDate, version, changeLog, tag, platforms} = ext;
          const {owner} = extractGitUrl(repoUrl);

          return {
            id,
            url: repoUrl,
            title,
            description,
            changeLog,
            updateDate,
            version,
            avatarUrl,
            developer: owner,
            tag,
            platforms,
          };
        });

        if (!isEmpty(data)) setList(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchExtensionsList();
  }, [userData]);

  return {loading};
}

export function useFilteredList(
  list: Extension_ListData[],
  selectedFilters: ExtFilter,
  setSelectedExt: Dispatch<SetStateAction<Extension_ListData | undefined>>,
  installed: string[],
) {
  const filteredList = useMemo(() => {
    if (selectedFilters === 'all' || selectedFilters.size === 4) return list;

    const isInstalledFilterActive = selectedFilters.has('installed');
    return list.filter(item => {
      const isInstalled = installed.includes(item.id);
      const matchesTag = selectedFilters.has(item.tag);

      if (!isInstalledFilterActive) {
        return !isInstalled && matchesTag;
      }

      return isInstalled || matchesTag;
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
      if (!filteredList.some(item => item.id === prevState.id)) {
        return filteredList[0];
      }
      return prevState;
    });
  }, [filteredList]);

  return filteredList;
}

export function useSortedList(list: Extension_ListData[], installed: string[]) {
  return useMemo(
    () =>
      [...list].sort((a, b) => {
        const aInstalled = installed.includes(a.id);
        const bInstalled = installed.includes(b.id);

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
            <Button radius="none" variant="light" className="cursor-default" isIconOnly>
              <MenuDots_Icon className="rotate-90 size-4" />
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
  selectedExt: Extension_ListData | undefined,
  setSelectedExt: Dispatch<SetStateAction<Extension_ListData | undefined>>,
  isLoaded: boolean,
  installed: InstalledExt[],
  unloaded: SkippedPlugins[],
) {
  const updateAvailable = useSettingsState('extensionsUpdateAvailable');
  return useCallback(
    (item: Extension_ListData) => {
      const foundInstalled = installed.find(i => i.id === item.id);
      const foundUnloaded = unloaded.find(u => foundInstalled?.dir === u.folderName);
      return (
        <Card
          className={
            `hover:bg-foreground-100 hover:-translate-x-1 hover:shadow-medium relative ` +
            ` border-2 border-foreground-100 ${selectedExt?.id === item.id && '!border-primary'}` +
            ` rounded-xl !transition-all !duration-300 mb-2 bg-foreground-50`
          }
          as="div"
          shadow="sm"
          onPress={() => setSelectedExt(item)}
          fullWidth
          isPressable>
          <CardHeader className="pb-0">
            <User
              avatarProps={{
                src: item.avatarUrl,
                radius: 'none',
                className: 'shrink-0 !bg-opacity-0',
              }}
              description={
                <span className="text-foreground-500 text-small">
                  By <span className="font-bold text-foreground-500">{item.developer}</span>
                </span>
              }
              name={
                <div className="space-x-2">
                  <Link
                    size="lg"
                    href={item.url}
                    className="text-primary-500 transition-colors duration-300 font-semibold"
                    isExternal>
                    {item.title}
                  </Link>
                  <Chip
                    size="sm"
                    radius="sm"
                    variant="flat"
                    className={`${updateAvailable.includes(item.id) && 'text-warning'}`}>
                    v{item.version}
                  </Chip>
                  {/*{foundInstalled && (
                    <Chip size="sm" variant="flat" color="default">
                      Installed
                    </Chip>
                  )}*/}
                  {updateAvailable.includes(item.id) && (
                    <Chip size="sm" variant="faded" color="success">
                      Update
                    </Chip>
                  )}
                </div>
              }
              className="justify-start mt-2"
            />
          </CardHeader>

          <CardBody className="pl-[3.7rem] py-0">
            <Typography.Paragraph className="mt-2" ellipsis={{rows: 2, tooltip: true}}>
              {item.description}
            </Typography.Paragraph>
          </CardBody>

          <CardFooter className="flex flex-row items-center gap-x-2 pl-[3.7rem] pt-0">
            <div className="flex flex-row px-0 space-x-1">
              {item.platforms.includes('linux') && <Linux_Icon className="size-4" />}
              {item.platforms.includes('win32') && <Windows_Icon className="size-4" />}
              {item.platforms.includes('darwin') && <MacOS_Icon className="size-4" />}
            </div>
            {foundUnloaded && (
              <Tooltip delay={300} content={foundUnloaded.message} showArrow>
                <Chip size="sm" variant="faded" color="warning">
                  Unloaded
                </Chip>
              </Tooltip>
            )}
          </CardFooter>
        </Card>
      );
    },
    [installed, selectedExt, isLoaded, updateAvailable],
  );
}
