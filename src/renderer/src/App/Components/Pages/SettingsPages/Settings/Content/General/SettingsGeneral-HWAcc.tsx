import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';

export default function SettingsGeneralHwAcc() {
  const dispatch = useDispatch<AppDispatch>();
  const hardwareAcceleration = useSettingsState('hardwareAcceleration');

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('app', {hardwareAcceleration: selected});
      dispatch(settingsActions.setSettingsState({key: 'hardwareAcceleration', value: selected}));
    },
    [dispatch],
  );

  return (
    <LynxSwitch
      description={
        <>
          Enables hardware acceleration to potentially improve performance.
          <br />
          If you experience lagging or freezing, try disabling this option.
        </>
      }
      enabled={hardwareAcceleration}
      onEnabledChange={onEnabledChange}
      title="Use Hardware Acceleration"
    />
  );
}
