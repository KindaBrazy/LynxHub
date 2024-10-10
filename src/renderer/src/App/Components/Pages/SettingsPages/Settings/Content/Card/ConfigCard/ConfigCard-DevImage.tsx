import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../../../../../Redux/Store';
import rendererIpc from '../../../../../../../RendererIpc';
import LynxSwitch from '../../../../../../Reusable/LynxSwitch';

/** Toggle cards normal or compact mode */
export default function ConfigCardDevImage() {
  const cardsDevImage = useSettingsState('cardsDevImage');
  const dispatch = useDispatch<AppDispatch>();

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('cards', {cardsDevImage: selected});
      dispatch(settingsActions.setSettingsState({key: 'cardsDevImage', value: selected}));
    },
    [dispatch],
  );

  return (
    <LynxSwitch
      size="sm"
      className="text-start"
      title="Developer Image"
      enabled={cardsDevImage}
      onEnabledChange={onEnabledChange}
      description="Show developer avatar"
    />
  );
}