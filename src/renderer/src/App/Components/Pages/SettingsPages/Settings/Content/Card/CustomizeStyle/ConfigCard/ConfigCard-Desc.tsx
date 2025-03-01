import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../../../../../Redux/Store';
import rendererIpc from '../../../../../../../../RendererIpc';
import LynxSwitch from '../../../../../../../Reusable/LynxSwitch';

/** Toggle cards normal or compact mode */
export default function ConfigCardDesc() {
  const cardsDesc = useSettingsState('cardsDesc');
  const dispatch = useDispatch<AppDispatch>();

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('cards', {cardsDesc: selected});
      dispatch(settingsActions.setSettingsState({key: 'cardsDesc', value: selected}));
    },
    [dispatch],
  );

  return (
    <LynxSwitch
      size="sm"
      enabled={cardsDesc}
      title="Description"
      className="text-start"
      onEnabledChange={onEnabledChange}
      description="Show Project description"
    />
  );
}
