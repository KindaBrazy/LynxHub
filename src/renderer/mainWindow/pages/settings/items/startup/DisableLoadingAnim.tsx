import LynxSwitch from '@lynx/components/LynxSwitch';
import {settingsActions, useSettingsState} from '@lynx/redux/reducers/settings';
import {AppDispatch} from '@lynx/redux/store';
import storageIpc from '@lynx_shared/ipc/storage';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';

export default function DisableLoadingAnim() {
  const dispatch = useDispatch<AppDispatch>();
  const disableLoadingAnimations = useSettingsState('disableLoadingAnimations');

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      storageIpc.update('app', {disableLoadingAnimations: selected});
      dispatch(settingsActions.setSettingsState({key: 'disableLoadingAnimations', value: selected}));
    },
    [dispatch],
  );

  return (
    <SettingsFilterItem
      searchTexts={[
        'Disable Loading Window Animations',
        'disable loading animations',
        'startup',
        'loading window',
        'visual effects',
        'performance',
      ]}>
      <LynxSwitch
        onEnabledChange={onEnabledChange}
        enabled={disableLoadingAnimations}
        title="Disable Loading Window Animations"
        description={'Disables loading windows animations to reduce visual effects and improve performance'}
      />
    </SettingsFilterItem>
  );
}
