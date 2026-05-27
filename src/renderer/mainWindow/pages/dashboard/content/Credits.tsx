import {Avatar, Button, Description, Label} from '@heroui/react';
import SettingsSection from '@lynx/components/SettingsSection';
import {PATREON_URL} from '@lynx_common/consts';
import {PatreonSupporter, PatreonSupporterTier} from '@lynx_common/types';
import staticsIpc from '@lynx_shared/ipc/statics';
import {HeartAngle, HeartPulse2, SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useEffect, useMemo, useState} from 'react';

export const DashboardCreditsId = 'settings_credits_elem';

interface TierStyle {
  emoji: string;
  badge: string;
  gradient: string;
  glow: string;
  borderColor: string;
  dotColor: string;
  accentText: string;
}

const TIER_STYLES: Record<PatreonSupporterTier, TierStyle> = {
  'Diamond Sponsor': {
    emoji: '💎',
    badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    gradient: 'from-cyan-500/10 via-transparent to-transparent',
    glow: 'group-hover:shadow-[0_0_15px_rgba(6,182,212,0.12)]',
    borderColor: 'hover:border-cyan-500/30',
    dotColor: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]',
    accentText: 'text-cyan-500 dark:text-cyan-400',
  },
  'Platinum Sponsor': {
    emoji: '🏆',
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    gradient: 'from-amber-500/10 via-transparent to-transparent',
    glow: 'group-hover:shadow-[0_0_15px_rgba(245,158,11,0.12)]',
    borderColor: 'hover:border-amber-500/30',
    dotColor: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
    accentText: 'text-amber-500 dark:text-amber-400',
  },
};

const MAX_DISPLAYED_SUPPORTERS = 50;
const tiers: PatreonSupporterTier[] = ['Diamond Sponsor', 'Platinum Sponsor'];

const DashboardCredits = memo(() => {
  const [expandedTier, setExpandedTier] = useState<PatreonSupporterTier | null>(null);
  const [supporters, setSupporters] = useState<PatreonSupporter[]>([]);

  useEffect(() => {
    let mounted = true;
    staticsIpc.getPatrons().then(data => {
      if (mounted && data) {
        setSupporters(data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const groupedSupporters = useMemo(
    () =>
      supporters.reduce(
        (acc, supporter) => {
          if (!acc[supporter.tier]) {
            acc[supporter.tier] = [];
          }
          acc[supporter.tier].push(supporter);
          return acc;
        },
        {} as Record<PatreonSupporterTier, PatreonSupporter[]>,
      ),
    [supporters],
  );

  const handleBecomePatron = () => {
    window.open(PATREON_URL);
  };

  return (
    <SettingsSection title="Credits" id={DashboardCreditsId} icon={<HeartPulse2 className="size-5" />} itemsCenter>
      {/* Premium Hero Banner */}
      <div
        className={
          'relative mb-10 overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80' +
          ' bg-zinc-50 dark:bg-zinc-900/40 p-6 lg:p-8 shadow-xs'
        }>
        <div
          className={
            'absolute inset-0 bg-radial from-blue-500/5 via-transparent to-transparent opacity-80 pointer-events-none'
          }
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-xl text-start">
            <div
              className={
                'inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600' +
                ' dark:text-blue-400 text-xs font-semibold mb-3'
              }>
              <HeartAngle className="size-3.5" />
              <span>Backer Community</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Supporting Open Development
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              This project is built and maintained with dedication. Your contributions cover direct infrastructure, API
              fees, and help support regular independent updates.
            </p>
          </div>

          {/* Action Callout Box */}
          <div
            className={
              'relative shrink-0 flex flex-col items-center lg:items-start bg-white/60 dark:bg-zinc-950/40 border' +
              ' border-zinc-200/50 dark:border-zinc-800 p-5 rounded-2xl min-w-xs lg:min-w-sm'
            }>
            <Button
              className={
                'w-full font-bold text-sm text-white bg-rose-600 hover:bg-rose-500 dark:bg-rose-500' +
                ' dark:hover:bg-rose-400 shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 py-5' +
                ' rounded-xl transition-all duration-300 hover:scale-[1.01]'
              }
              onPress={handleBecomePatron}>
              Join the Patrons <SquareTopDown className="size-4" />
            </Button>

            <div
              className={
                'mt-4 w-full border-t border-zinc-200/60 dark:border-zinc-800/80 pt-3 flex items-center' +
                ' justify-around text-2xs font-semibold text-zinc-500 dark:text-zinc-400'
              }>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-rose-500" />
                Profile Badge
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-indigo-500" />
                Discord Role
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsor Tiers */}
      <div className="space-y-12">
        {tiers.map(tier => {
          const style = TIER_STYLES[tier];
          const list = groupedSupporters[tier] || [];
          const hasSupporters = list.length > 0;
          const isExpanded = expandedTier === tier;
          const displayedList = isExpanded ? list : list.slice(0, MAX_DISPLAYED_SUPPORTERS);

          return (
            <div key={tier} className="relative">
              {/* Tier Section Header */}
              <div
                className={
                  'mb-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3'
                }>
                <div className="flex items-center space-x-3">
                  <span className={`flex size-9 items-center justify-center rounded-lg text-lg ${style.badge}`}>
                    {style.emoji}
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-none">{tier}s</h3>
                    <p className="text-2xs font-medium text-zinc-400 dark:text-zinc-500 mt-1">
                      {list.length} {list.length === 1 ? 'member' : 'members'} active
                    </p>
                  </div>
                </div>

                {list.length > MAX_DISPLAYED_SUPPORTERS && (
                  <Button
                    size="sm"
                    variant="tertiary"
                    className={'font-semibold text-2xs'}
                    onPress={() => setExpandedTier(isExpanded ? null : tier)}>
                    {isExpanded ? 'Show Less' : `Show All ${list.length}`}
                  </Button>
                )}
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {hasSupporters ? (
                  <>
                    {displayedList.map(supporter => {
                      const nameInitials = supporter.name
                        .split(' ')
                        .slice(0, 2)
                        .map(item => item[0])
                        .join('')
                        .toUpperCase();

                      return (
                        <Button
                          className={
                            `group relative flex h-auto w-full items-center justify-start gap-3 rounded-xl border` +
                            ` border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 p-3 text-start` +
                            ` transition-all duration-300 ${style.borderColor} ${style.glow} hover:-translate-y-0.5`
                          }
                          key={supporter.name}
                          onPress={() => window.open(supporter.homePage)}>
                          <div
                            className={
                              `absolute inset-0 rounded-xl bg-linear-to-br ${style.gradient} opacity-0` +
                              ` group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`
                            }
                          />

                          <Avatar
                            className={'size-9 shrink-0 shadow-2xs border border-zinc-200/40 dark:border-zinc-700/50'}>
                            <Avatar.Image alt={supporter.name} src={supporter.imageUrl} />
                            <Avatar.Fallback
                              className={
                                'font-semibold text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                              }>
                              {nameInitials}
                            </Avatar.Fallback>
                          </Avatar>

                          <div className="flex flex-col min-w-0 z-10">
                            <div className="flex items-center gap-1.5">
                              <span className={`size-1.5 rounded-full shrink-0 ${style.dotColor}`} />
                              <Label
                                className={
                                  'truncate font-bold text-xs text-zinc-800 dark:text-zinc-200 ' +
                                  'group-hover:text-zinc-900 dark:group-hover:text-white transition-colors'
                                }>
                                {supporter.name}
                              </Label>
                            </div>
                            <Description className="truncate text-3xs text-zinc-400 dark:text-zinc-400 mt-1">
                              Since {supporter.memberSince}
                            </Description>
                          </div>
                        </Button>
                      );
                    })}

                    {/* Standardized "+ Join this tier" button */}
                    <button
                      className={
                        'group relative flex h-full w-full items-center justify-center gap-2 rounded-xl ' +
                        'border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/40 ' +
                        'dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 p-3 text-center' +
                        ' transition-all duration-300 hover:border-zinc-450 dark:hover:border-zinc-600 min-h-14.5'
                      }
                      onClick={handleBecomePatron}>
                      <span
                        className={
                          'text-zinc-500 dark:text-zinc-300 group-hover:text-zinc-850' +
                          ' dark:group-hover:text-white font-bold text-xs transition-colors'
                        }>
                        + Join this tier
                      </span>
                    </button>
                  </>
                ) : (
                  /* Standardized Card-sized Placeholder */
                  <button
                    className={
                      'group relative flex h-auto w-full items-center justify-start gap-3 rounded-xl border' +
                      ' border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/40 ' +
                      'dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 p-3 ' +
                      'text-start transition-all duration-300 hover:border-zinc-450 ' +
                      'dark:hover:border-zinc-600 min-h-14.5'
                    }
                    onClick={handleBecomePatron}>
                    <div
                      className={
                        'flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100' +
                        ' dark:bg-zinc-800/80 text-zinc-500 group-hover:scale-105 transition-transform'
                      }>
                      <HeartPulse2 className={`size-4.5 ${style.accentText}`} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={
                          'font-bold text-xs text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900' +
                          ' dark:group-hover:text-white transition-colors'
                        }>
                        Be the first {tier.replace('Sponsor', '')}
                      </span>
                      <span className="text-3xs text-zinc-450 dark:text-zinc-400 mt-0.5 font-medium">
                        Claim this card slot
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SettingsSection>
  );
});

DashboardCredits.displayName = 'DashboardCredits';

export default DashboardCredits;
