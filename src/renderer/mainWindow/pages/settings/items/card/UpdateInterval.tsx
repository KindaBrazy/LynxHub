import {NumberInput} from '@heroui/react';
import {cardsActions, useCardsState} from '@lynx/redux/reducers/cards';
import {AppDispatch} from '@lynx/redux/store';
import storageIpc from '@lynx_shared/ipc/storage';
import {Stopwatch} from '@solar-icons/react-perf/BoldDuotone';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

/**
 * Allows the user to configure the frequency (in minutes) at which
 * the application checks for updates to their dashboard cards.
 */
export default function UpdateInterval() {
  const updateInterval = useCardsState('checkUpdateInterval');
  const dispatch = useDispatch<AppDispatch>();

  const handleIntervalChange = (value: number) => {
    if (value) {
      dispatch(cardsActions.setUpdateInterval(value));
      storageIpc.update('cards', {checkUpdateInterval: value});
    }
  };

  return (
    <SettingsFilterItem
      searchTexts={['Update check frequency:', 'update interval', 'card update', 'check for updates', 'minutes']}>
      <div className="w-full text-start flex flex-col gap-y-1">
        <NumberInput
          label={
            <div className="flex flex-row gap-x-1 items-center justify-start">
              <Stopwatch />
              <SettingsSearchHighlight text="Update check frequency:" />
            </div>
          }
          minValue={2}
          value={updateInterval}
          labelPlacement="outside"
          aria-label="Card Update Interval"
          onValueChange={handleIntervalChange}
          endContent={<span className="text-sm">Minutes</span>}
        />
      </div>
    </SettingsFilterItem>
  );
}
