import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsBrowser_Links() {
  const dispatch = useDispatch<AppDispatch>();
  const openLinkExternal = useSettingsState('openLinkExternal');

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('app', {openLinkExternal: selected});
      dispatch(settingsActions.setSettingsState({key: 'openLinkExternal', value: selected}));
    },
    [dispatch],
  );

  const titleText = 'Open links externally';
  const descriptionText = 'When enabled, links will open in your system’s default browser instead of inside the app.';

  return (
    <SettingsFilterItem
      searchTexts={[titleText, descriptionText, 'links', 'browser', 'open externally', 'default browser']}>
      <LynxSwitch
        title={titleText}
        enabled={openLinkExternal}
        description={descriptionText}
        onEnabledChange={onEnabledChange}
      />
    </SettingsFilterItem>
  );
}
