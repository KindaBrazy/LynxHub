import {Button, Card, User} from '@heroui/react';
import {useEffect, useMemo, useState} from 'react';

import {PATREON_URL} from '../../../../../../../../cross/CrossConstants';
import {PatreonSupporter, PatreonSupporterTier} from '../../../../../../../../cross/CrossTypes';
import {ExternalDuo_Icon} from '../../../../../../../context_menu/Components/SvgIcons';
import {Heart_Icon, Patreon_Icon, UserHeart_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../../../../RendererIpc';
import SettingsSection from '../../Settings/SettingsPage-ContentSection';

export const DashboardCreditsId = 'settings_credits_elem';

const TIER_EMOJI: Record<PatreonSupporterTier, string> = {
  'Platinum Sponsor': '🏆',
  'Diamond Sponsor': '💎',
};

const TIER_COLORS: Record<PatreonSupporterTier, 'warning' | 'primary'> = {
  'Platinum Sponsor': 'warning',
  'Diamond Sponsor': 'primary',
};

const TIER_GRADIENTS: Record<PatreonSupporterTier, string> = {
  'Platinum Sponsor': 'from-yellow-400 via-yellow-500 to-yellow-600',
  'Diamond Sponsor': 'from-blue-400 via-blue-500 to-blue-600',
};

const MAX_DISPLAYED_SUPPORTERS = 50;

const tiers: PatreonSupporterTier[] = ['Diamond Sponsor', 'Platinum Sponsor'];

/** Reporting app issues on GitHub */
export default function DashboardCredits() {
  const [expandedTier, setExpandedTier] = useState<PatreonSupporterTier | null>(null);
  const [supporters, setSupporters] = useState<PatreonSupporter[]>([]);

  useEffect(() => {
    rendererIpc.statics.getPatrons().then(setSupporters);
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
    <SettingsSection title="Credits" id={DashboardCreditsId} icon={<UserHeart_Icon className="size-5" />} itemsCenter>
      {/* Hero Section */}
      <div
        className={
          'relative mb-6 overflow-hidden rounded-2xl bg-linear-to-br from-blue-50 via-sky-50' +
          ' to-indigo-50 p-6 dark:from-blue-900/20 dark:via-sky-900/20 dark:to-indigo-900/20'
        }>
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-sky-500/10 to-indigo-500/10"></div>
        <div className="relative z-10 text-center">
          <div className="mb-3 flex items-center justify-center">
            <div className="animate-pulse rounded-full bg-linear-to-r from-blue-500 to-indigo-500 p-2">
              <Heart_Icon className="size-5 text-white" />
            </div>
          </div>
          <h2
            className={
              'mb-1 bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent'
            }>
            Our Amazing Sponsors
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Thank you for making this project possible! 🙏</p>
        </div>
      </div>

      {/* Sponsor Tiers */}
      <div className="space-y-8">
        {tiers.map(tier => (
          <div key={tier} className="relative">
            {/* Tier Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`rounded-full bg-linear-to-r ${TIER_GRADIENTS[tier]} p-2 shadow-lg`}>
                  <span className="text-lg">{TIER_EMOJI[tier]}</span>
                </div>
                <div className="flex flex-col items-start">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tier}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {groupedSupporters[tier]?.length || 0} amazing supporters
                  </p>
                </div>
              </div>

              {groupedSupporters[tier]?.length > MAX_DISPLAYED_SUPPORTERS && (
                <Button
                  size="sm"
                  variant="flat"
                  color={TIER_COLORS[tier]}
                  onPress={() => setExpandedTier(expandedTier === tier ? null : tier)}
                  className="font-semibold shadow-lg transition-all duration-300 hover:scale-105">
                  {expandedTier === tier ? 'Show Less' : `Show All ${groupedSupporters[tier].length}`}
                </Button>
              )}
            </div>

            {/* Supporters Grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(208px,1fr))] gap-4">
              {(groupedSupporters[tier] || [])
                .slice(0, expandedTier === tier ? undefined : MAX_DISPLAYED_SUPPORTERS)
                .map(supporter => (
                  <Card
                    className={
                      'group relative overflow-hidden rounded-xl bg-foreground-50' +
                      ' p-4 shadow backdrop-blur-xs transition-all duration-300 hover:scale-105' +
                      ' hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/80 min-w-52!'
                    }
                    key={supporter.name}
                    isPressable>
                    <div
                      className={
                        `absolute inset-0 bg-linear-to-br ${TIER_GRADIENTS[tier]} opacity-0` +
                        ` transition-opacity duration-300 group-hover:opacity-10`
                      }
                    />
                    <User
                      avatarProps={{
                        src: supporter.imageUrl,
                        color: TIER_COLORS[tier],
                        className: 'shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-lg',
                        size: 'md',
                      }}
                      classNames={{
                        wrapper: 'w-full',
                        name:
                          'font-semibold text-gray-900 dark:text-white group-hover:text-gray-700' +
                          ' dark:group-hover:text-gray-200 text-sm',
                        description: 'text-gray-500 dark:text-gray-400 text-xs text-start',
                      }}
                      name={supporter.name}
                      className="relative z-10 cursor-pointer"
                      onClick={() => window.open(supporter.homePage)}
                      description={`Member Since: ${supporter.memberSince}`}
                    />
                  </Card>
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
                  <UserHeart_Icon className="size-6 text-gray-400" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">No {tier}s Yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Be the first to support us at this tier!</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <div className="mx-auto max-w-xs">
          <Card
            as="div"
            onPress={handleBecomePatron}
            className={'overflow-hidden p-4 transition-all duration-300 hover:scale-105 dark:bg-foreground-100 '}
            isPressable>
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
                <ExternalDuo_Icon className="size-3" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </SettingsSection>
  );
}
