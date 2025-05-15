import {Button, User} from '@heroui/react';
import {Card, Empty} from 'antd';
import {useEffect, useMemo, useState} from 'react';

import {PATREON_URL, PATRONS_DATA} from '../../../../../../../../cross/CrossConstants';
import {
  ExternalLink_Icon,
  Heart_Icon,
  Patreon_Icon,
  UserHeart_Icon,
} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import SettingsSection from '../../Settings/SettingsPage-ContentSection';

export const DashboardCreditsId = 'settings_credits_elem';

type SupporterTier = 'Platinum Sponsor' | 'Diamond Sponsor';

interface Supporter {
  name: string;
  tier: SupporterTier;
  imageUrl: string;
  memberSince: string;
}

const TIER_EMOJI: Record<SupporterTier, string> = {
  'Platinum Sponsor': '🏆',
  'Diamond Sponsor': '💎',
};

const TIER_COLORS: Record<SupporterTier, 'warning' | 'primary'> = {
  'Platinum Sponsor': 'warning',
  'Diamond Sponsor': 'primary',
};

const MAX_DISPLAYED_SUPPORTERS = 50;

const tiers: SupporterTier[] = ['Diamond Sponsor', 'Platinum Sponsor'];

/** Reporting app issues on GitHub */
export default function DashboardCredits() {
  const [expandedTier, setExpandedTier] = useState<SupporterTier | null>(null);
  const [supporters, setSupporters] = useState<Supporter[]>([]);

  useEffect(() => {
    async function fetchPatrons() {
      const response = await fetch(PATRONS_DATA);
      const data = (await response.json()) as {patrons: Supporter[]};
      setSupporters(data.patrons);
    }

    fetchPatrons();
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
        {} as Record<SupporterTier, Supporter[]>,
      ),
    [supporters],
  );

  const handleBecomePatron = () => {
    window.open(PATREON_URL);
  };

  return (
    <SettingsSection title="Credits" id={DashboardCreditsId} icon={<UserHeart_Icon className="size-5" />} itemsCenter>
      <div className="mb-8 flex flex-row items-center justify-center space-x-2 text-center text-2xl font-semibold">
        <span>
          <Heart_Icon className="text-danger" />
        </span>
        <span>Our Amazing Sponsors</span>
      </div>
      {tiers.map(tier => (
        <div key={tier} className="mb-12">
          <h3 className="mb-4 flex items-center justify-between text-2xl font-semibold">
            <span className={`text-${TIER_COLORS[tier]} flex items-center`}>
              {TIER_EMOJI[tier]} <span className="ml-2">{tier}</span>
            </span>
            {groupedSupporters[tier]?.length > MAX_DISPLAYED_SUPPORTERS && (
              <Button
                size="sm"
                variant="flat"
                color={TIER_COLORS[tier]}
                onPress={() => setExpandedTier(expandedTier === tier ? null : tier)}>
                {expandedTier === tier ? 'Show Less' : 'Show All'}
              </Button>
            )}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
            {(groupedSupporters[tier] || [])
              .slice(0, expandedTier === tier ? undefined : MAX_DISPLAYED_SUPPORTERS)
              .map(supporter => (
                <User
                  key={supporter.name}
                  name={supporter.name}
                  className="transition duration-300 hover:scale-105"
                  description={`Member Since: ${supporter.memberSince}`}
                  avatarProps={{src: supporter.imageUrl, color: TIER_COLORS[tier], className: 'shrink-0'}}
                />
              ))}
            {(!groupedSupporters[tier] || groupedSupporters[tier].length === 0) && (
              <Empty description="No Sponsors Yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </div>
      ))}

      <Card
        size="small"
        onClick={handleBecomePatron}
        classNames={{body: 'flex flex-row items-center justify-center space-x-2'}}
        hoverable>
        <Patreon_Icon className="size-4" />
        <span>Become a Patron</span>
        <ExternalLink_Icon className="ExternalLink" />
      </Card>
    </SettingsSection>
  );
}
