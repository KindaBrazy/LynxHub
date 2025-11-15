import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsStartupDisableLoadingAnim() {
  const dispatch = useDispatch<AppDispatch>();
  const disableLoadingAnimations = useSettingsState('disableLoadingAnimations');

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('app', {disableLoadingAnimations: selected});
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
