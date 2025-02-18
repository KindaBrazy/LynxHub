import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';

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

  return (
    <LynxSwitch
      enabled={dynamicAppTitle}
      title="Dynamic App Title"
      onEnabledChange={onAppTitleChange}
      description="Automatically update the app's title and taskbar name based on the active AI or tool."
    />
  );
}
