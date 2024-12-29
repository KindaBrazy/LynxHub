import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Link,
  Skeleton,
  User,
} from '@nextui-org/react';
import {List, Typography} from 'antd';
import {motion} from 'framer-motion';
import {isEmpty, isNil} from 'lodash';
import {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';

import {EXTENSION_CONTAINER} from '../../../../../../../cross/CrossConstants';
import {Extension_ListData, ExtensionsInfo} from '../../../../../../../cross/CrossTypes';
import {extractGitUrl} from '../../../../../../../cross/CrossUtils';
import {MenuDots_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons2';
import {Linux_Icon, MacOS_Icon, Windows_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons5';
import {useSettingsState} from '../../../../Redux/App/SettingsReducer';
import {ExtFilter} from './ExtensionList';

export function useFetchExtensions(setList: Dispatch<SetStateAction<Extension_ListData[]>>) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);

    async function fetchExtensionsList() {
      try {
        const response = await fetch(EXTENSION_CONTAINER);
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
  }, []);

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
  installed: string[],
) {
  const updateAvailable = useSettingsState('extensionsUpdateAvailable');
  return useCallback(
    (item: Extension_ListData) => {
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
              className="inset-y-0 left-0 w-[0.15rem] bg-secondary absolute"
            />
          )}
          <div className="flex flex-col">
            <Skeleton isLoaded={!isLoaded} className="rounded-lg">
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
                    {installed.includes(item.id) && (
                      <Chip size="sm" radius="sm" variant="faded" color="default">
                        Installed
                      </Chip>
                    )}
                    {updateAvailable.includes(item.id) && (
                      <Chip size="sm" radius="sm" variant="faded" color="success">
                        Update
                      </Chip>
                    )}
                  </div>
                }
                className="justify-start mt-2"
                avatarProps={{src: item.avatarUrl}}
              />
            </Skeleton>
            <Skeleton isLoaded={!isLoaded} className="rounded-lg">
              <Typography.Paragraph>{item.description}</Typography.Paragraph>
            </Skeleton>
            <div className="flex flex-row items-center gap-x-2">
              {item.platforms.includes('linux') && <Linux_Icon className="size-5 text-[#FF9800]" />}
              {item.platforms.includes('win32') && <Windows_Icon className="size-5 text-[#4285F4]" />}
              {item.platforms.includes('darwin') && <MacOS_Icon className="size-5" />}
            </div>
          </div>
        </List.Item>
      );
    },
    [installed, selectedExt, isLoaded, updateAvailable],
  );
}
