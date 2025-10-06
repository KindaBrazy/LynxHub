import {Tab, Tabs} from '@heroui/react';
import {AnimatePresence, motion} from 'framer-motion';
import {isNil} from 'lodash';
import {Key, useEffect, useMemo, useState} from 'react';

import {extractGitUrl} from '../../../../../../../../cross/CrossUtils';
import {ChangelogItem, ChangelogSubItem} from '../../../../../../../../cross/plugin/PluginTypes';
import {useDebounceBreadcrumb} from '../../../../../../../Breadcrumbs';
import {Info_Icon, ListCheck_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../../../../Extensions/ExtensionLoader';
import {usePluginsState} from '../../../../../Redux/Reducer/PluginsReducer';
import LynxScroll from '../../../../Reusable/LynxScroll';
import MarkdownViewer from '../../../../Reusable/MarkdownViewer';

const renderChangelogEntry = (item: ChangelogSubItem, depth = 0, key: string | number) => {
  if (typeof item === 'string') {
    return (
      <motion.div
        key={key}
        animate={{opacity: 1, x: 0}}
        initial={{opacity: 0, x: -10}}
        transition={{duration: 0.3, delay: depth * 0.05}}
        className={`${depth > 0 ? 'ml-6 mt-2' : 'mt-3'}`}>
        <div className="flex items-start gap-3 group">
          <motion.div
            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 transition-colors duration-200 ${
              depth > 0
                ? 'bg-foreground-400 group-hover:bg-foreground-500'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 group-hover:shadow-lg group-hover:shadow-blue-500/50'
            }`}
            whileHover={{scale: 1.3}}
          />
          <span
            className={
              'text-sm leading-relaxed text-foreground-700' +
              ' group-hover:text-foreground-900 transition-colors duration-200'
            }>
            {item}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={key}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4}}
      initial={{opacity: 0, y: -10}}
      className={`${depth > 0 ? 'ml-6' : ''} mt-3`}>
      {Object.entries(item).map(([label, subitems]) => (
        <div key={label}>
          <div className="text-sm font-semibold text-foreground-800 mb-1.5">{label}</div>
          <div className="space-y-1">
            {subitems.map((subitem, index) => renderChangelogEntry(subitem, depth + 1, index))}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

const Changelog = ({items}: {items: ChangelogItem}) => (
  <div className="space-y-6">
    {Object.entries(items).map(([category, entries], idx) => (
      <motion.div
        key={category}
        animate={{opacity: 1, y: 0}}
        initial={{opacity: 0, y: 20}}
        transition={{duration: 0.5, delay: idx * 0.1}}>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground-200 to-transparent" />
          <h3
            className={
              'font-bold text-sm text-foreground-900 uppercase tracking-wide px-3 py-2 bg-foreground-100 rounded-full'
            }>
            {category}
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground-200 to-transparent" />
        </div>
        <div className="space-y-2">{entries.map((entry, index) => renderChangelogEntry(entry, 0, index))}</div>
      </motion.div>
    ))}
  </div>
);

export default function PreviewBody({installed}: {installed: boolean}) {
  const selectedPlugin = usePluginsState('selectedPlugin');
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

      <AnimatePresence mode="wait">
        {currentTab === 'readme' && (
          <motion.div
            key="readme"
            exit={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3}}
            initial={{opacity: 0, y: 20}}
            className="size-full overflow-hidden">
            {isNil(ReplaceMd) ? (
              <MarkdownViewer urlType="raw" url={rawReadmeUrl} />
            ) : (
              <ReplaceMd repoPath={selectedPlugin?.url || ''} />
            )}
          </motion.div>
        )}

        {currentTab === 'changelog' && (
          <motion.div
            key="changelog"
            exit={{opacity: 0}}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.3}}
            className="size-full overflow-hidden">
            <LynxScroll className="gap-y-8 px-6 py-4 size-full">
              {selectedPlugin?.changes.map((version, index) => (
                <motion.div
                  className="relative"
                  animate={{opacity: 1, x: 0}}
                  initial={{opacity: 0, x: -30}}
                  key={`${version.version}_${index}`}
                  transition={{duration: 0.5, delay: index * 0.1}}>
                  <div
                    className={`
                      relative overflow-hidden rounded-xl p-6 mb-6
                      transition-all duration-300
                      ${
                        index === 0
                          ? 'bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent' +
                            ' border-2 border-secondary shadow-lg shadow-secondary/20'
                          : 'bg-foreground-50/50 border border-foreground-200' +
                            ' hover:border-foreground-300 hover:shadow-md'
                      }
                    `}>
                    {/* Decorative corner accent */}
                    {index === 0 && (
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className={
                          'absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ' +
                          'from-secondary/20 to-transparent rounded-bl-full'
                        }
                      />
                    )}

                    {/* Version badge */}
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                      <motion.div
                        className={`
                          px-2 py-1 rounded-lg font-bold text-sm
                          ${
                            index === 0
                              ? 'bg-gradient-to-r from-secondary to-secondary/80 ' +
                                'text-white shadow-lg shadow-secondary/30'
                              : 'bg-foreground-200 text-foreground-900'
                          }
                        `}
                        whileHover={{scale: 1.05}}>
                        {version.version}
                      </motion.div>

                      {index === 0 && (
                        <motion.div
                          className={
                            'px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600' +
                            ' text-white text-xs font-semibold rounded-full shadow-md'
                          }
                          transition={{delay: 0.3}}
                          animate={{opacity: 1, scale: 1}}
                          initial={{opacity: 0, scale: 0.8}}>
                          Latest
                        </motion.div>
                      )}
                    </div>

                    {/* Changelog content */}
                    <div className="relative z-10">
                      {version.items.map((item, itemIndex) => (
                        <Changelog items={item} key={`${itemIndex}_changelog`} />
                      ))}
                    </div>
                  </div>

                  {/* Connecting line between versions */}
                  {index < (selectedPlugin?.changes.length || 0) - 1 && (
                    <motion.div
                      className={
                        'absolute left-6 top-full w-0.5 h-6 bg-gradient-to-b ' +
                        'from-foreground-300 to-transparent origin-top'
                      }
                      initial={{scaleY: 0}}
                      animate={{scaleY: 1}}
                      transition={{duration: 0.5, delay: index * 0.1 + 0.3}}
                    />
                  )}
                </motion.div>
              ))}
            </LynxScroll>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
