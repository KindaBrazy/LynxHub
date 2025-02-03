import {
  Button,
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
import {List, Typography} from 'antd';
import {motion} from 'framer-motion';
import {isEmpty, isNil} from 'lodash';
import {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';

import {EXTENSION_CONTAINER, EXTENSION_CONTAINER_EA} from '../../../../../../../cross/CrossConstants';
import {Extension_ListData, ExtensionsInfo} from '../../../../../../../cross/CrossTypes';
import {extractGitUrl} from '../../../../../../../cross/CrossUtils';
import {SkippedPlugins} from '../../../../../../../cross/IpcChannelAndTypes';
import {MenuDots_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons2';
import {Linux_Icon, MacOS_Icon, Windows_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons5';
import {useSettingsState} from '../../../../Redux/App/SettingsReducer';
import {useUserState} from '../../../../Redux/User/UserReducer';
import {ExtFilter} from './ExtensionList';
import {InstalledExt} from './ExtensionsPage';

export function useFetchExtensions(setList: Dispatch<SetStateAction<Extension_ListData[]>>) {
  const [loading, setLoading] = useState<boolean>(true);
  const userData = useUserState('patreonUserData');

  useEffect(() => {
    async function fetchExtensionsList() {
      setLoading(true);
      try {
        const response = await fetch(userData.earlyAccess ? EXTENSION_CONTAINER_EA : EXTENSION_CONTAINER);
        const extensions = (await response.json()) as ExtensionsInfo[];

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
        <List.Item
          className={
            `hover:bg-foreground-50 ${selectedExt?.id === item.id && 'bg-foreground-50'} ` +
            ` transition-colors duration-200 relative`
          }
          onClick={() => setSelectedExt(item)}>
          {selectedExt?.id === item.id && (
            <motion.div
              layoutId="sel"
              transition={{bounce: 0.2, duration: 0.4, type: 'spring'}}
              className="inset-y-0 left-0 w-[0.15rem] bg-primary absolute"
            />
          )}
          <div className="flex flex-col">
            <User
              description={
                <div className="space-x-2">
                  <span className={`${updateAvailable.includes(item.id) && 'text-warning'}`}>{item.version}</span>
                  <span>{item.developer}</span>
                </div>
              }
              name={
                <div className="space-x-2">
                  <Link
                    href={item.url}
                    className="text-small text-primary-500 transition-colors duration-300"
                    isExternal>
                    {item.title}
                  </Link>
                  {foundInstalled && (
                    <Chip size="sm" variant="flat" color="default">
                      Installed
                    </Chip>
                  )}
                  {updateAvailable.includes(item.id) && (
                    <Chip size="sm" variant="faded" color="success">
                      Update
                    </Chip>
                  )}
                </div>
              }
              className="justify-start mt-2"
              avatarProps={{src: item.avatarUrl}}
            />

            <Typography.Paragraph className="mt-2">{item.description}</Typography.Paragraph>

            <div className="flex flex-row items-center gap-x-2">
              {item.platforms.includes('linux') && <Linux_Icon className="size-5 text-[#FF9800]" />}
              {item.platforms.includes('win32') && <Windows_Icon className="size-5 text-[#4285F4]" />}
              {item.platforms.includes('darwin') && <MacOS_Icon className="size-5" />}
              {foundUnloaded && (
                <Tooltip delay={300} content={foundUnloaded.message} showArrow>
                  <Chip size="sm" variant="faded" color="warning">
                    Unloaded
                  </Chip>
                </Tooltip>
              )}
            </div>
          </div>
        </List.Item>
      );
    },
    [installed, selectedExt, isLoaded, updateAvailable],
  );
}
