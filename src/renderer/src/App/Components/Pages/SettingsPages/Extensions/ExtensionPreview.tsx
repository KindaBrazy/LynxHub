import {List} from '@mantine/core';
import {Button, ButtonGroup, Link, ScrollShadow, Tab, Tabs} from '@nextui-org/react';
import {Divider} from 'antd';
import {isEmpty, isNil} from 'lodash';
import {Fragment, Key, useCallback, useMemo, useState} from 'react';

import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import MarkdownViewer from '../../../Reusable/MarkdownViewer';
import {testChangelog} from './testData';

type ListItem = {
  name: string;
  subitems?: ListItem[];
};

type ChangelogItems = {
  title: string;
  items: ListItem[];
};

export default function ExtensionPreview() {
  const [installed] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<Key>('readme');

  const [changelog] = useState<ChangelogItems[]>(testChangelog);

  const renderSubItems = useCallback((items?: ListItem[], parentKey: string = '') => {
    if (isNil(items) || isEmpty(items)) return null;

    return (
      <List listStyleType="disc" withPadding>
        {items.map((item, index) => {
          const currentKey = `${parentKey}_${index}`;
          return (
            <Fragment key={currentKey}>
              <List.Item>{item.name}</List.Item>
              {item.subitems && renderSubItems(item.subitems, currentKey)}
            </Fragment>
          );
        })}
      </List>
    );
  }, []);

  const ReplaceMd = useMemo(() => extensionsData.replaceMarkdownViewer, []);

  return (
    <div
      className={
        ' absolute right-2 inset-y-2 rounded-lg border border-foreground/10 justify-between' +
        ' overflow-hidden shadow-small bg-white dark:bg-foreground-100' +
        ' transition-[left] duration-500 sm:left-[17rem] lg:left-[21rem] 2xl:left-[25rem]'
      }>
      <div className="absolute bg-foreground-200 inset-x-0 flex flex-col p-4 gap-y-1 top-0">
        <span>Python Package Manager</span>
        <div className="flex flex-row gap-x-2 items-center">
          <span className="text-small">V1.2.6</span>
          <Divider type="vertical" />
          <Link href={'some address'} className="text-small text-primary-500" isExternal>
            KindaBrazy
          </Link>
          <Divider type="vertical" />
          <Link href={'some address'} className="text-small text-primary-500" isExternal>
            Home Page
          </Link>
        </div>
      </div>
      <div className="absolute inset-x-0 top-[5.2rem] flex flex-col bottom-10">
        <Tabs
          variant="underlined"
          className="font-Nunito"
          onSelectionChange={setCurrentTab}
          selectedKey={currentTab.toString()}
          fullWidth>
          <Tab title="README" key={'readme'} className="cursor-default"></Tab>
          <Tab title="ChangeLog" key={'changelog'} className="cursor-default"></Tab>
        </Tabs>
        {currentTab === 'readme' &&
          (isNil(ReplaceMd) ? (
            <MarkdownViewer rounded={false} repoPath="kindabrazy/lynxhub" />
          ) : (
            <ReplaceMd rounded={false} repoPath="kindabrazy/lynxhub" />
          ))}
        {currentTab === 'changelog' && (
          <ScrollShadow
            className={
              'absolute top-10 bottom-5 inset-x-0 flex flex-col justify-start' +
              ' items-start pt-8 pl-6 gap-y-4 font-Nunito'
            }
            hideScrollBar>
            {changelog.map((item, index) => (
              <Fragment key={`section_${index}`}>
                <List listStyleType="disc">
                  <span className="text-large font-semibold">{item.title}</span>
                  {renderSubItems(item.items, `section_${index}`)}
                </List>
                {index < changelog.length - 1 && <Divider />}
              </Fragment>
            ))}
          </ScrollShadow>
        )}
      </div>
      <div className="absolute bottom-0 inset-x-0">
        <ButtonGroup radius="none" variant="flat" fullWidth>
          {installed ? (
            <>
              <Button color="danger">Uninstall</Button>
              <Button color="warning">Disable</Button>
            </>
          ) : (
            <Button color="success">Install</Button>
          )}
        </ButtonGroup>
      </div>
    </div>
  );
}
