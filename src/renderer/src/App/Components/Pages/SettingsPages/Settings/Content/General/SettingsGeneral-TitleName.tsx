import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsGeneralTitleName() {
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
