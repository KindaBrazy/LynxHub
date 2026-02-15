import {Tab, Tabs} from '@heroui/react';
import MarkdownViewer from '@lynx/components/MarkdownViewer';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {usePluginsState} from '@lynx/redux/reducers/plugins';
import {getPluginReadmeUrl} from '@lynx_common/utils/plugins';
import {useDebounceBreadcrumb} from '@lynx_shared/sentry/Breadcrumbs';
import {HomeAngle2} from '@solar-icons/react-perf/BoldDuotone';
import {Checklist} from '@solar-icons/react-perf/LineDuotone';
import {AnimatePresence, motion} from 'framer-motion';
import {isNil} from 'lodash';
import {Key, useEffect, useMemo, useState} from 'react';

import ChangelogList from './ChangelogList';

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
    return getPluginReadmeUrl(repoUrl) || '';
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
              <HomeAngle2 />
              <span>Readme</span>
            </div>
          }
          key={'readme'}
        />
        <Tab
          title={
            <div className="flex flex-row items-center gap-x-2">
              <Checklist />
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

        {currentTab === 'changelog' && <ChangelogList />}
      </AnimatePresence>
    </div>
  );
}
