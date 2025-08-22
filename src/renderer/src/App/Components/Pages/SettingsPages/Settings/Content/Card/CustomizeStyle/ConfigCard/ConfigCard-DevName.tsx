import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../../../../../Redux/Store';
import rendererIpc from '../../../../../../../../RendererIpc';
import LynxSwitch from '../../../../../../../Reusable/LynxSwitch';

/** Toggle cards normal or compact mode */
export default function ConfigCardDevName() {
  const cardsDevName = useSettingsState('cardsDevName');
  const dispatch = useDispatch<AppDispatch>();

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('cards', {cardsDevName: selected});
      dispatch(settingsActions.setSettingsState({key: 'cardsDevName', value: selected}));
    },
    [dispatch],
  );

  return (
    <LynxSwitch
      size="sm"
      enabled={cardsDevName}
      title=" Developer Name"
      className="text-start !pr-4"
      onEnabledChange={onEnabledChange}
      description=" Show developer name"
    />
  );
}
