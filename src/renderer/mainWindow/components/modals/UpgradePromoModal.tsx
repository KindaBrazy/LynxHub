import {Button, Modal} from '@heroui/react';
import {appActions, useAppState} from '@lynx/redux/reducers/app';
import {LYNXHUB_WEBSITE} from '@lynx_common/consts';
import storageIpc from '@lynx_shared/ipc/storage';
import {Crown, ShieldStar, Star} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import TabModal from '../TabModal';

/**
 * Modal that prompts users on the free tier to upgrade their subscription
 * once they have used the app on 3 distinct days and for at least 7 hours.
 */
export default function UpgradePromoModal() {
  const showUpgradePromo = useAppState('showUpgradePromo');
  const dispatch = useDispatch();

  const handleClose = useCallback(
    (upgrade: boolean) => {
      dispatch(appActions.setAppState({key: 'showUpgradePromo', value: false}));
      storageIpc.update('app', {hasSeenUpgradePromo: true});
      if (upgrade) {
        window.open(`${LYNXHUB_WEBSITE}/account`);
      }
    },
    [dispatch],
  );

  return (
    <TabModal size="md" isOpen={showUpgradePromo} onOpenChange={() => handleClose(false)}>
      <Modal.Header>
        <Modal.Heading className="flex items-center gap-x-2 text-warning">
          <Crown className="size-6 shrink-0 animate-pulse" />
          <span>Unlock Premium Updates</span>
        </Modal.Heading>
      </Modal.Header>
      <Modal.Body className="space-y-4">
        <p className="text-sm leading-relaxed text-foreground select-none">
          If you enjoy using LynxHub, want to support ongoing development, and get access to exclusive supporter
          benefits, consider upgrading your tier on Patreon:
        </p>
        <div className="space-y-3">
          {/* Early Access */}
          <div className="flex gap-3 bg-default/40 p-3.5 rounded-2xl border border-divider/50">
            <div className="p-1.5 bg-LynxBlue/10 rounded-lg inline-flex shrink-0 self-start mt-0.5">
              <Star className="size-5 text-LynxBlue shrink-0" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-foreground">Early Access Tier ($6/mo)</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed select-none">
                Get client, extension, and module updates **2 weeks to 2 months sooner** than public releases. Includes
                Early Access Discord channel and voting rights.
              </p>
            </div>
          </div>

          {/* Insider Nightly */}
          <div className="flex gap-3 bg-default/40 p-3.5 rounded-2xl border border-divider/50">
            <div className="p-1.5 bg-yellow-500/10 rounded-lg inline-flex shrink-0 self-start mt-0.5">
              <ShieldStar className="size-5 text-yellow-500 shrink-0" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-foreground">Insider Nightly builds ($15+/mo)</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed select-none">
                Access bleeding-edge **Insider Nightly Builds** (2x more builds) with nightly client, extension, and
                module updates.
              </p>
            </div>
          </div>

          {/* Premium Perks */}
          <div className="flex gap-3 bg-default/40 p-3.5 rounded-2xl border border-divider/50">
            <div className="p-1.5 bg-purple-500/10 rounded-lg inline-flex shrink-0 self-start mt-0.5">
              <Crown className="size-5 text-LynxPurple shrink-0" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-foreground">Priority Support & Credits</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed select-none">
                Higher sponsor tiers (Platinum & Diamond) get their **name featured in the application credits** and
                **Priority Support** with direct developer access.
              </p>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onPress={() => handleClose(false)}>
          Maybe Later
        </Button>
        <Button variant="primary" onPress={() => handleClose(true)} className="font-bold cursor-pointer">
          <Crown className="size-4 shrink-0" />
          Upgrade Now
        </Button>
      </Modal.Footer>
    </TabModal>
  );
}
