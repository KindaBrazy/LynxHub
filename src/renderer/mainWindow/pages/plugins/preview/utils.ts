import {ChipProps} from '@heroui-v3/react';
import {SubscribeStages} from '@lynx_common/types';

/**
 * Returns a user-friendly name for a given subscription stage.
 */
export function getStageDisplayName(stage: SubscribeStages) {
  switch (stage) {
    case 'insider':
      return 'Insider';
    case 'early_access':
      return 'Early Access';
    default:
      return 'Public';
  }
}

/**
 * Returns the appropriate color for a stage indicator chip.
 */
export function getStageColor(stage: SubscribeStages): ChipProps['color'] {
  switch (stage) {
    case 'insider':
      return 'accent';
    case 'early_access':
      return 'warning';
    default:
      return 'success';
  }
}
