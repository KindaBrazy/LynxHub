import {Chip} from '@heroui/react';
import {motion} from 'framer-motion';
import {memo} from 'react';

import {ChangelogItem, ChangelogSubItem} from '../../../../../../../../cross/plugin/PluginTypes';
import {usePluginsState} from '../../../../../Redux/Reducer/PluginsReducer';
import LynxScroll from '../../../../Reusable/LynxScroll';

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
          <Chip variant="flat">{category}</Chip>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground-200 to-transparent" />
        </div>
        <div className="space-y-2">{entries.map((entry, index) => renderChangelogEntry(entry, 0, index))}</div>
      </motion.div>
    ))}
  </div>
);

const ChangelogList = memo(() => {
  const selectedPlugin = usePluginsState('selectedPlugin');
  const installedList = usePluginsState('installedList');

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
          const isCurrent =
            version.version === installedList.find(item => item.id === selectedPlugin?.metadata.id)?.version;
          return (
            <motion.div
              className="relative"
              animate={{opacity: 1, x: 0}}
              initial={{opacity: 0, x: -30}}
              key={`${version.version}_${index}`}
              transition={{duration: 0.5, delay: index * 0.1}}>
              <div
                className={`relative overflow-hidden rounded-xl px-4 py-4 mb-6 transition-all duration-200 ${
                  index === 0
                    ? 'bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent' +
                      ' border-2 border-secondary shadow-lg shadow-secondary/20'
                    : 'bg-foreground-50/50 border border-foreground-200' +
                      ' hover:border-foreground-300 hover:shadow-md'
                }`}>
                {/* Version badge */}
                <div className="flex items-center gap-x-2 relative">
                  <Chip
                    size="sm"
                    variant={index === 0 ? 'shadow' : 'solid'}
                    color={index === 0 ? 'secondary' : 'default'}>
                    {version.version}
                  </Chip>

                  {isCurrent && (
                    <Chip size="sm" color="success">
                      Current
                    </Chip>
                  )}

                  {index === 0 && (
                    <Chip size="sm" color="primary">
                      Latest
                    </Chip>
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
          );
        })}
      </LynxScroll>
    </motion.div>
  );
});

export default ChangelogList;
