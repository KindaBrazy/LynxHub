import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import LynxSwitch from '../../../../components/LynxSwitch';
import rendererIpc from '../../../../ipc';
import {settingsActions, useSettingsState} from '../../../../redux/reducers/settings';
import {AppDispatch} from '../../../../redux/store';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function HWAcc() {
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
    'Enables hardware acceleration to potentially improve performance.' +
    ' If you experience lagging or freezing, try disabling this option.';

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
