import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../../../../../Redux/Store';
import rendererIpc from '../../../../../../../../RendererIpc';
import LynxSwitch from '../../../../../../../Reusable/LynxSwitch';

/** Toggle cards normal or compact mode */
export default function ConfigCardRepoInfo() {
  const cardsRepoInfo = useSettingsState('cardsRepoInfo');
  const dispatch = useDispatch<AppDispatch>();

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('cards', {cardsRepoInfo: selected});
      dispatch(settingsActions.setSettingsState({key: 'cardsRepoInfo', value: selected}));
    },
    [dispatch],
  );

  return (
    <LynxSwitch
      size="sm"
      className="text-start"
      enabled={cardsRepoInfo}
      title=" Repository Info"
      onEnabledChange={onEnabledChange}
      description=" Show repository Information"
    />
  );
}
