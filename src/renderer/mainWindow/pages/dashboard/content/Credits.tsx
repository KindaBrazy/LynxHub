import {Avatar, Button, Description, Label} from '@heroui-v3/react';
import SettingsSection from '@lynx/components/SettingsSection';
import {Patreon_Icon} from '@lynx_assets/icons';
import {PATREON_URL} from '@lynx_common/consts';
import {PatreonSupporter, PatreonSupporterTier} from '@lynx_common/types';
import staticsIpc from '@lynx_shared/ipc/statics';
import {HeartAngle, HeartPulse2, SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useEffect, useMemo, useState} from 'react';

export const DashboardCreditsId = 'settings_credits_elem';

const TIER_EMOJI: Record<PatreonSupporterTier, string> = {
  'Platinum Sponsor': '🏆',
  'Diamond Sponsor': '💎',
};

const TIER_COLORS: Record<PatreonSupporterTier, 'bg-warning' | 'bg-accent'> = {
  'Platinum Sponsor': 'bg-warning',
  'Diamond Sponsor': 'bg-accent',
};

const TIER_GRADIENTS: Record<PatreonSupporterTier, string> = {
  'Platinum Sponsor': 'from-yellow-400 via-yellow-500 to-yellow-600',
  'Diamond Sponsor': 'from-blue-400 via-blue-500 to-blue-600',
};

const MAX_DISPLAYED_SUPPORTERS = 50;

const tiers: PatreonSupporterTier[] = ['Diamond Sponsor', 'Platinum Sponsor'];

/** Reporting app issues on GitHub */
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
      {/* Hero Section */}
      <div
        className={
          'relative mb-6 overflow-hidden rounded-2xl bg-linear-to-br from-blue-50 via-sky-50' +
          ' to-indigo-50 p-6 dark:from-blue-900/20 dark:via-sky-900/20 dark:to-indigo-900/20'
        }>
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-sky-500/10 to-indigo-500/10" />
        <div className="relative z-10 text-center">
          <div className="mb-3 flex items-center justify-center">
            <div className="animate-pulse rounded-full bg-linear-to-r from-blue-500 to-indigo-500 p-2">
              <HeartAngle className="size-5 text-white" />
            </div>
          </div>
          <h2
            className={
              'mb-1 bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent'
            }>
            Our Amazing Sponsors
          </h2>
          {supporters.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-300">Thank you for making this project possible! 🙏</p>
          )}
        </div>
      </div>

      {/* Sponsor Tiers */}
      <div className="space-y-8">
        {tiers.map(tier => (
          <div key={tier} className="relative">
            {/* Tier Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={
                    `rounded-full bg-linear-to-r ${TIER_GRADIENTS[tier]} size-12 flex` +
                    ` items-center justify-center shadow-lg shrink-0`
                  }>
                  <span className="text-2xl">{TIER_EMOJI[tier]}</span>
                </div>
                <div className="flex flex-col items-start">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tier.replace('Sponsor', '')}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {groupedSupporters[tier]?.length || 0} {tier}'s
                  </p>
                </div>
              </div>

              {groupedSupporters[tier]?.length > MAX_DISPLAYED_SUPPORTERS && (
                <Button
                  size="sm"
                  className={TIER_COLORS[tier]}
                  onPress={() => setExpandedTier(expandedTier === tier ? null : tier)}>
                  {expandedTier === tier ? 'Show Less' : `Show All ${groupedSupporters[tier].length}`}
                </Button>
              )}
            </div>

            {/* Supporters Grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(208px,1fr))] gap-4">
              {(groupedSupporters[tier] || [])
                .slice(0, expandedTier === tier ? undefined : MAX_DISPLAYED_SUPPORTERS)
                .map(supporter => (
                  <Button
                    className={
                      'group relative overflow-hidden bg-surface' +
                      ' size-full py-4 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105' +
                      ' min-w-52! justify-start'
                    }
                    key={supporter.name}
                    onPress={() => window.open(supporter.homePage)}>
                    <div
                      className={
                        `absolute inset-0 bg-linear-to-br ${TIER_GRADIENTS[tier]} opacity-0` +
                        ` transition-opacity duration-300 group-hover:opacity-10`
                      }
                    />
                    <div className="inline-flex items-center gap-2 text-start">
                      <Avatar className="size-12 shrink-0">
                        <Avatar.Image alt={supporter.name} src={supporter.imageUrl} className={TIER_COLORS[tier]} />
                        <Avatar.Fallback className={TIER_COLORS[tier]}>
                          {...supporter.name.split(' ').map(item => item.slice(0, 1))}
                        </Avatar.Fallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <Label>{supporter.name}</Label>
                        <Description>Member Since: {supporter.memberSince}</Description>
                      </div>
                    </div>
                  </Button>
                ))}
            </div>

            {/* Empty State */}
            {(!groupedSupporters[tier] || groupedSupporters[tier].length === 0) && (
              <div
                className={
                  'rounded-xl border-2 border-dashed border-gray-300 bg-gray-50' +
                  ' p-8 text-center dark:border-gray-600 dark:bg-gray-800'
                }>
                <div
                  className={
                    'mx-auto mb-3 flex size-12 items-center justify-center rounded-full' +
                    ' bg-gray-200 dark:bg-gray-700'
                  }>
                  <HeartPulse2 className="size-6 text-gray-400" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">No {tier}s Yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Be the first to support at this tier!</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-12 mb-4 text-center">
        <div className="mx-auto max-w-xs">
          <Button
            className={
              'overflow-hidden transition-all duration-300 shadow hover:scale-105 bg-surface size-fit py-5 px-8'
            }
            onPress={handleBecomePatron}>
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-full bg-linear-to-r from-blue-500 to-blue-600 p-2">
                <Patreon_Icon className="size-5 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Become a Patron</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">Support my work and get exclusive perks</p>
              </div>
              <div className="flex items-center space-x-1 font-medium text-blue-600 dark:text-blue-400">
                <span className="text-sm">Join now</span>
                <SquareTopDown className="size-3" />
              </div>
            </div>
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
});

DashboardCredits.displayName = 'DashboardCredits';

export default DashboardCredits;
