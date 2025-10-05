import {Tab, Tabs} from '@heroui/react';
import {Divider} from 'antd';
import {isNil} from 'lodash';
import {Key, useEffect, useMemo, useState} from 'react';

import {extractGitUrl} from '../../../../../../../../cross/CrossUtils';
import {ChangelogItem, ChangelogSubItem} from '../../../../../../../../cross/plugin/PluginTypes';
import {useDebounceBreadcrumb} from '../../../../../../../Breadcrumbs';
import {Info_Icon, ListCheck_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../../../../Extensions/ExtensionLoader';
import LynxScroll from '../../../../Reusable/LynxScroll';
import MarkdownViewer from '../../../../Reusable/MarkdownViewer';
import {useExtensionPageStore} from '../Page';

const renderChangelogEntry = (item: ChangelogSubItem, depth = 0, key: string | number) => {
  if (typeof item === 'string') {
    return (
      <div key={key} className={`${depth > 0 ? 'ml-4 mt-1' : 'mt-2'}`}>
        <div className="flex items-start gap-2">
          {/* Use different bullet colors based on nesting depth */}
          <div
            className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${depth > 0 ? 'bg-foreground-400' : 'bg-blue-500'}`}
          />
          <span className="text-sm leading-relaxed text-foreground-600">{item}</span>
        </div>
      </div>
    );
  }

  return (
    <div key={key} className={`${depth > 0 ? 'ml-4' : ''} mt-2`}>
      {Object.entries(item).map(([label, subitems]) => (
        <div key={label}>
          <div className="text-sm font-medium text-foreground-800">{label}</div>
          <div className="mt-1">
            {subitems.map((subitem, index) => renderChangelogEntry(subitem, depth + 1, index))}
          </div>
        </div>
      ))}
    </div>
  );
};

const Changelog = ({items}: {items: ChangelogItem}) => (
  <div className="space-y-4">
    {Object.entries(items).map(([category, entries]) => (
      <div key={category}>
        <h3 className="font-semibold text-base text-foreground-900">{category}</h3>
        <div className="mt-1">{entries.map((entry, index) => renderChangelogEntry(entry, 0, index))}</div>
      </div>
    ))}
  </div>
);

export default function PreviewBody({installed}: {installed: boolean}) {
  const selectedPlugin = useExtensionPageStore(state => state.selectedPlugin);
  const [currentTab, setCurrentTab] = useState<Key>('changelog');

  useDebounceBreadcrumb('Plugin tab', [currentTab]);

  useEffect(() => {
    setCurrentTab(installed ? 'changelog' : 'readme');
  }, [installed]);

  const ReplaceMd = useMemo(() => extensionsData.replaceMarkdownViewer, []);

  const rawReadmeUrl = useMemo(() => {
    const repoUrl = selectedPlugin?.url;
    if (!repoUrl) {
      return '';
    }

    try {
      const {owner, repo} = extractGitUrl(repoUrl);

      if (owner && repo) {
        return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/source/README.md`;
      }
    } catch (error) {
      console.error('Failed to parse repository URL:', repoUrl, error);
    }

    return '';
  }, [selectedPlugin?.url]);

  return (
    <div className="w-full flex flex-col overflow-hidden">
      <Tabs
        variant="light"
        color="primary"
        className="mb-2 ml-2"
        onSelectionChange={setCurrentTab}
        selectedKey={currentTab.toString()}>
        <Tab
          title={
            <div className="flex flex-row items-center gap-x-2">
              <Info_Icon />
              <span>Readme</span>
            </div>
          }
          key={'readme'}
        />
        <Tab
          title={
            <div className="flex flex-row items-center gap-x-2">
              <ListCheck_Icon />
              <span>Changelog</span>
            </div>
          }
          key={'changelog'}
        />
      </Tabs>
      {currentTab === 'readme' &&
        (isNil(ReplaceMd) ? (
          <MarkdownViewer urlType="raw" url={rawReadmeUrl} />
        ) : (
          <ReplaceMd repoPath={selectedPlugin?.url || ''} />
        ))}
      {currentTab === 'changelog' && (
        <LynxScroll className="gap-y-6 ml-6 py-2 flex flex-col mr-4">
          {selectedPlugin?.changes.map((version, index) => (
            <div key={`${version}_${index}_changeItem`}>
              <div
                className={
                  `border-l-4 pl-4 mt-6 transition-all duration-300 hover:-translate-x-2 ` +
                  `${index === 0 ? 'border-secondary' : 'border-default'}`
                }
                key={index}>
                <h3 className={`text-lg font-semibold mb-3 transition-colors duration-200`}>{version.version}</h3>
                <div className="space-y-1">
                  {version.items.map((item, itemIndex) => (
                    <Changelog items={item} key={`${itemIndex}_changelog`} />
                  ))}
                </div>
              </div>
              {index === 0 && <Divider />}
            </div>
          ))}
        </LynxScroll>
      )}
    </div>
  );
}
