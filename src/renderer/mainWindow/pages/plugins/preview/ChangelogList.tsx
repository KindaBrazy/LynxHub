import {Chip} from '@heroui-v3/react';
import LynxScroll from '@lynx/components/LynxScroll';
import {usePluginsState} from '@lynx/redux/reducers/plugins';
import {SubscribeStages} from '@lynx_common/types';
import {ChangelogItem, ChangelogSubItem, PluginChangelog} from '@lynx_common/types/plugins';
import {motion} from 'framer-motion';
import {memo} from 'react';

import {getStageColor, getStageDisplayName} from './utils';

/**
 * Props for the {@link ChangelogEntry} component.
 */
interface ChangelogEntryProps {
  /** The specific changelog item (string or nested object). */
  item: ChangelogSubItem;
  /** Recursion depth for indentation. */
  depth?: number;
  /** Unique key for React rendering. */
  id: string | number;
}

/**
 * Renders a single changelog entry, supporting nested categories recursively.
 */
function ChangelogEntry({item, depth = 0, id}: ChangelogEntryProps) {
  if (typeof item === 'string') {
    return (
      <motion.div
        key={id}
        animate={{opacity: 1, x: 0}}
        initial={{opacity: 0, x: -10}}
        className={`${depth > 0 && 'ml-6'} mt-1`}
        transition={{duration: 0.3, delay: depth * 0.05}}>
        <div className="flex items-start gap-x-2 group">
          <motion.div
            className={`size-2 rounded-full mt-1.5 shrink-0 transition-colors duration-200 group-hover:scale-110 ${
              depth > 0 ? 'bg-muted group-hover:bg-muted/70' : 'bg-accent group-hover:bg-accent-hover'
            }`}
            whileHover={{scale: 1.3}}
          />
          <span
            className={
              'text-sm leading-relaxed transition-colors duration-200 text-foreground group-hover:text-foreground/80'
            }>
            {item}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={id}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4}}
      initial={{opacity: 0, y: -10}}
      className={`${depth > 0 && 'ml-6'} mt-1`}>
      {Object.entries(item).map(([label, subItems]) => (
        <div key={label}>
          <div className="flex items-start gap-x-2 group">
            <motion.div
              className={`size-2 rounded-full mt-1.5 shrink-0 transition-colors duration-200 group-hover:scale-110 ${
                depth > 0 ? 'bg-muted group-hover:bg-muted/70' : 'bg-accent group-hover:bg-accent-hover'
              }`}
              whileHover={{scale: 1.3}}
            />
            <div className="text-sm font-semibold text-foreground mb-1.5">{label}</div>
          </div>
          <div className="space-y-1">
            {subItems.map((subItem, index) => (
              <ChangelogEntry id={index} item={subItem} depth={depth + 1} key={`${label}_${index}`} />
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/**
 * Renders a group of changelog entries under a specific category (e.g., "Added").
 */
function CategoryGroup({category, entries}: {category: string; entries: ChangelogSubItem[]}) {
  return (
    <div>
      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1 bg-linear-to-r from-transparent via-muted/30 to-transparent" />
        <Chip>{category}</Chip>
        <div className="h-px flex-1 bg-linear-to-r from-transparent via-muted/30 to-transparent" />
      </div>
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <ChangelogEntry depth={0} id={index} item={entry} key={`${category}_${index}`} />
        ))}
      </div>
    </div>
  );
}

/**
 * Renders a list of categories for a single changelog item.
 */
function ChangelogSection({item}: {item: ChangelogItem}) {
  return (
    <div className="space-y-6">
      {Object.entries(item).map(([category, entries], idx) => (
        <motion.div
          key={category}
          animate={{opacity: 1, y: 0}}
          initial={{opacity: 0, y: 20}}
          transition={{duration: 0.5, delay: idx * 0.1}}>
          <CategoryGroup entries={entries} category={category} />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Props for the {@link VersionHistoryCard} component.
 */
interface VersionHistoryCardProps {
  /** The changelog data for a specific version. */
  versionData: PluginChangelog;
  /** Index in the list (used for styling and animation delay). */
  index: number;
  /** Whether this version matches the currently installed version. */
  isInstalledVersion: boolean;
  /** Total number of versions in the list. */
  totalCount: number;
  stage: SubscribeStages | undefined;
}

/**
 * Renders a card representing a single version in the plugin's history.
 */
function VersionHistoryCard({versionData, index, isInstalledVersion, totalCount, stage}: VersionHistoryCardProps) {
  const isLatest = index === 0;

  return (
    <motion.div
      className="relative"
      key={versionData.version}
      animate={{opacity: 1, x: 0}}
      initial={{opacity: 0, x: -30}}
      transition={{duration: 0.5, delay: index * 0.1}}>
      <div
        className={`border shadow-sm hover:shadow-md bg-surface relative overflow-hidden 
        rounded-3xl px-4 py-4 mb-6 transition-all duration-300 ${
          isLatest ? 'border-LynxPurple/50 hover:border-LynxPurple/70' : 'border-surface hover:border-surface-secondary'
        }`}>
        {/* Version markers (Latest, Current, Version Number) */}
        <div className="flex items-center gap-x-2 relative w-full justify-between">
          <div className="flex items-center gap-x-2">
            {isLatest && (
              <Chip size="sm" variant="soft" color="accent">
                Latest
              </Chip>
            )}

            <Chip size="sm" variant="soft" color={isLatest ? 'accent' : 'warning'}>
              {versionData.version}
            </Chip>

            {isInstalledVersion && (
              <Chip size="sm" variant="soft" color="success">
                Installed
              </Chip>
            )}
          </div>

          {stage && (
            <Chip size="sm" variant="soft" color={getStageColor(stage)}>
              {getStageDisplayName(stage)}
            </Chip>
          )}
        </div>

        {/* Categories and entries for this version */}
        <div className="relative z-10 mt-4">
          {versionData.items.map((changelogItem, itemIndex) => (
            <ChangelogSection item={changelogItem} key={`${versionData.version}_v_${itemIndex}`} />
          ))}
        </div>
      </div>

      {/* Connecting line between version cards to represent a timeline */}
      {index < totalCount - 1 && (
        <motion.div
          initial={{scaleY: 0}}
          animate={{scaleY: 1}}
          transition={{duration: 0.5, delay: index * 0.1 + 0.3}}
          className={'absolute left-6 top-full w-0.5 h-6 bg-linear-to-b from-muted/60 to-transparent origin-top'}
        />
      )}
    </motion.div>
  );
}

/**
 * Component that displays the complete version history/changelog for a plugin.
 */
const PluginChangelogList = memo(() => {
  const selectedPlugin = usePluginsState('selectedPlugin');
  const installedList = usePluginsState('installedList');

  const selectedPluginId = selectedPlugin?.metadata.id;
  const installedVersion = installedList.find(item => item.id === selectedPluginId)?.version;

  return (
    <motion.div
      key="changelog"
      exit={{opacity: 0}}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: 0.3}}
      className="size-full overflow-hidden">
      <LynxScroll className="gap-y-8 px-6 py-4 size-full">
        {selectedPlugin?.changes.map((version, index) => {
          const stage = selectedPlugin?.versions.find(v => v.version === version.version)?.stage;
          return (
            <VersionHistoryCard
              index={index}
              stage={stage}
              key={version.version}
              versionData={version}
              totalCount={selectedPlugin.changes.length}
              isInstalledVersion={version.version === installedVersion}
            />
          );
        })}
      </LynxScroll>
    </motion.div>
  );
});

PluginChangelogList.displayName = 'PluginChangelogList';

export default PluginChangelogList;
