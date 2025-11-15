import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

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

  const titleText = 'Use Hardware Acceleration';
  const descriptionText =
    'Enables hardware acceleration to potentially improve performance. If you experience lagging or freezing, try disabling this option.';

  return (
    <SettingsFilterItem
      searchTexts={[titleText, descriptionText, 'hardware acceleration', 'gpu', 'performance', 'lag', 'freeze']}>
      <LynxSwitch
        description={
          <>
            Enables hardware acceleration to potentially improve performance.
            <br />
            If you experience lagging or freezing, try disabling this option.
          </>
        }
        title={titleText}
        enabled={hardwareAcceleration}
        onEnabledChange={onEnabledChange}
      />
    </SettingsFilterItem>
  );
}
