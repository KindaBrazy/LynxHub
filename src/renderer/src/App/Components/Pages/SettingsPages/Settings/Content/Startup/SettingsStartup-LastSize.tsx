import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsStartupLastSize() {
  const dispatch = useDispatch<AppDispatch>();
  const openLastSize = useSettingsState('openLastSize');

  const onOpenLastSizeChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('app', {openLastSize: selected});
      dispatch(settingsActions.setSettingsState({key: 'openLastSize', value: selected}));
    },
    [dispatch],
  );

  return (
    <SettingsFilterItem
      searchTexts={[
        'Start in Last Window Size and Position',
        'start in last window size',
        'last position',
        'startup',
        'window size',
        'window position',
      ]}>
      <LynxSwitch
        enabled={openLastSize}
        onEnabledChange={onOpenLastSizeChange}
        title="Start in Last Window Size and Position"
        description="Start the app in the same window size and position as when it was last closed."
      />
    </SettingsFilterItem>
  );
}
