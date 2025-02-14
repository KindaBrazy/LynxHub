import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../../../../../../Redux/Store';
import rendererIpc from '../../../../../../../../RendererIpc';
import LynxSwitch from '../../../../../../../Reusable/LynxSwitch';

/** Toggle cards normal or compact mode */
export default function ConfigCardCompactMode() {
  const cardCompactMode = useSettingsState('cardsCompactMode');
  const dispatch = useDispatch<AppDispatch>();

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('cards', {cardCompactMode: selected});
      dispatch(settingsActions.setSettingsState({key: 'cardsCompactMode', value: selected}));
    },
    [dispatch],
  );

  return (
    <LynxSwitch
      title="Compact Mode"
      className="text-start"
      enabled={cardCompactMode}
      onEnabledChange={onEnabledChange}
      description="Display cards in a smaller size."
    />
  );
}
