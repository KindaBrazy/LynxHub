import LynxSwitch from '@lynx/components/LynxSwitch';
import {settingsActions, useSettingsState} from '@lynx/redux/reducers/settings';
import {AppDispatch} from '@lynx/redux/store';
import storageIpc from '@lynx_shared/ipc/storage';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';

export default function Links() {
  const dispatch = useDispatch<AppDispatch>();
  const openLinkExternal = useSettingsState('openLinkExternal');

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      storageIpc.update('app', {openLinkExternal: selected});
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
