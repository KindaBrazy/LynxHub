import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import LynxSwitch from '../../../../components/LynxSwitch';
import rendererIpc from '../../../../ipc';
import {settingsActions, useSettingsState} from '../../../../redux/reducers/settings';
import {AppDispatch} from '../../../../redux/store';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function TitleName() {
  const dispatch = useDispatch<AppDispatch>();
  const dynamicAppTitle = useSettingsState('dynamicAppTitle');

  const onAppTitleChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('app', {dynamicAppTitle: selected});
      dispatch(settingsActions.setSettingsState({key: 'dynamicAppTitle', value: selected}));
    },
    [dispatch],
  );

  const titleText = 'Dynamic App Title';
  const descriptionText = "Automatically update the app's title and taskbar name based on the active AI or tool.";

  return (
    <SettingsFilterItem
      searchTexts={[titleText, descriptionText, 'title', 'window title', 'taskbar name', 'active ai', 'dynamic name']}>
      <LynxSwitch
        title={titleText}
        enabled={dynamicAppTitle}
        description={descriptionText}
        onEnabledChange={onAppTitleChange}
      />
    </SettingsFilterItem>
  );
}
