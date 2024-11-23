import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Link,
  Skeleton,
  User,
} from '@nextui-org/react';
import {List, Typography} from 'antd';
import {motion} from 'framer-motion';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useCallback, useState} from 'react';

import {getIconByName} from '../../../../../assets/icons/SvgIconsContainer';
import {useAppState} from '../../../../Redux/App/AppReducer';
import {testExtensionsList} from './testData';

type ItemsList = {
  id: string;
  title: string;
  version: string;
  developer: string;
  description: string;
  url: string;
  avatarUrl: string;
};

export default function ExtensionList() {
  const [selectedKeys, setSelectedKeys] = useState('all');
  const [list] = useState<ItemsList[]>(testExtensionsList);
  const [installed] = useState<string[]>(['debug_toolkit', 'code_snippets_manager']);
  const [selectedExt, setSelectedExt] = useState<string>('Models Manager');
  const [isLoaded] = useState<boolean>(true);
  const isDarkMode = useAppState('darkMode');

  const onItemClick = (id: string) => {
    setSelectedExt(id);
  };

  const filterMenu = useCallback(() => {
    return (
      <>
        <Dropdown size="sm" closeOnSelect={false} className="border !border-foreground/15">
          <DropdownTrigger>
            <Button radius="none" variant="light" className="cursor-default" isIconOnly>
              {getIconByName('MenuDots', {className: 'rotate-90 size-4'})}
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
  }, []);

  const renderList = useCallback(
    (item: ItemsList) => {
      return (
        <List.Item
          className={
            `hover:bg-foreground-50 ${selectedExt === item.title && 'bg-foreground-50'} ` +
            ` transition-colors duration-200 cursor-pointer relative`
          }
          onClick={() => onItemClick(item.title)}>
          {selectedExt === item.title && (
            <motion.div
              layoutId="sel"
              transition={{bounce: 0.2, duration: 0.4, type: 'spring'}}
              className="inset-y-0 left-0 w-[0.15rem] bg-secondary absolute"
            />
          )}
          <div className="flex flex-col gap-y-1">
            <Skeleton isLoaded={isLoaded} className="rounded-lg">
              <User
                description={
                  <div className="space-x-2">
                    <span>{item.version}</span>
                    <span>{item.developer}</span>
                  </div>
                }
                name={
                  <div className="space-x-2">
                    <Link href={item.url} className="text-small text-primary-500" isExternal>
                      {item.title}
                    </Link>
                    {installed.includes(item.id) && (
                      <Chip size="sm" radius="sm" variant="faded" color="success">
                        Installed
                      </Chip>
                    )}
                  </div>
                }
                className="justify-start mt-2"
                avatarProps={{src: item.avatarUrl}}
              />
            </Skeleton>
            <Skeleton isLoaded={isLoaded} className="rounded-lg">
              <Typography.Paragraph>{item.description}</Typography.Paragraph>
            </Skeleton>
          </div>
        </List.Item>
      );
    },
    [list, installed],
  );

  return (
    <div
      className={
        'absolute inset-y-2 rounded-lg border border-foreground/10 sm:w-64 lg:w-80 2xl:w-96' +
        ' overflow-hidden shrink-0 shadow-small bg-white dark:bg-foreground-100' +
        ' transition-[width] duration-500'
      }>
      <Input
        variant="flat"
        endContent={filterMenu()}
        placeholder="Search for extensions..."
        startContent={getIconByName('Circle', {className: 'size-5'})}
        classNames={{inputWrapper: 'bg-foreground-200 rounded-none pr-0'}}
      />

      <OverlayScrollbarsComponent
        options={{
          overflow: {x: 'hidden', y: 'scroll'},
          scrollbars: {
            autoHide: 'scroll',
            clickScroll: true,
            theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
          },
        }}
        className="inset-0 absolute !top-10">
        <List size="small" dataSource={list} className="size-full" renderItem={renderList} itemLayout="horizontal" />
      </OverlayScrollbarsComponent>
    </div>
  );
}
