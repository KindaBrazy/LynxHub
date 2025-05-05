import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';

export default function SettingsGeneralLinks() {
  const dispatch = useDispatch<AppDispatch>();
  const openLinkExternal = useSettingsState('openLinkExternal');

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('app', {openLinkExternal: selected});
      dispatch(settingsActions.setSettingsState({key: 'openLinkExternal', value: selected}));
    },
    [dispatch],
  );

  return (
    <LynxSwitch
      enabled={openLinkExternal}
      title="Open links externally"
      onEnabledChange={onEnabledChange}
      description="When enabled, links will open in your system’s default browser instead of inside the app."
    />
  );
}
