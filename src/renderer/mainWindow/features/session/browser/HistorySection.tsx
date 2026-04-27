import EmptyStateCard from '@lynx/components/EmptyStateCard';
import {FavIcons} from '@lynx_common/types/ipc';
import {motion} from 'framer-motion';
import {memo, ReactNode} from 'react';

import HistoryItem from './HistoryItem';
import {getCachedHistoryData, invalidateHistoryCache} from './utils';

type SectionConfig = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  data: string[];
  itemType: 'favorite' | 'recent';
  favIconMap: Map<string, FavIcons>;
  onRefresh: (result: Awaited<ReturnType<typeof getCachedHistoryData>>) => void;
};

const fadeIn = {
  hidden: {opacity: 0},
  visible: {opacity: 1, transition: {duration: 0.2}},
};

const staggerContainer = {
  hidden: {opacity: 0},
  visible: {
    opacity: 1,
    transition: {staggerChildren: 0.03, delayChildren: 0.05},
  },
};

const itemFade = {
  hidden: {opacity: 0, y: 6},
  visible: {opacity: 1, y: 0, transition: {duration: 0.2}},
};

const HistorySection = memo(
  ({title, subtitle, icon, emptyTitle, emptyDescription, data, itemType, favIconMap, onRefresh}: SectionConfig) => {
    if (data.length > 0) {
      return (
        <motion.section variants={fadeIn} className="w-full">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-surface-secondary p-2.5">{icon}</div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="text-xs text-muted">{subtitle}</p>
            </div>
          </div>

          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-wrap gap-4">
            {data.slice(0, 12).map((item, index) => (
              <motion.div variants={itemFade} key={`${itemType}-${index}`}>
                <HistoryItem
                  onDataChange={() => {
                    invalidateHistoryCache();
                    getCachedHistoryData().then(onRefresh);
                  }}
                  recent={item}
                  type={itemType}
                  favIconMap={favIconMap}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      );
    }

    return (
      <motion.div variants={fadeIn}>
        <EmptyStateCard
          variant="secondary"
          bodyClassName="gap-y-0 px-6 py-12"
          description={<p className="text-sm text-muted">{emptyDescription}</p>}
          icon={<div className="mb-4 flex justify-center opacity-60">{icon}</div>}
          title={<h3 className="text-base font-medium text-semi-muted">{emptyTitle}</h3>}
        />
      </motion.div>
    );
  },
);

export default HistorySection;
