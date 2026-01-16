import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import LynxSwitch from '../../../../components/LynxSwitch';
import {terminalActions, useTerminalState} from '../../../../redux/reducers/terminal';
import {AppDispatch} from '../../../../redux/store';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function Ligatures() {
  const enableLigatures = useTerminalState('enableLigatures');
  const dispatch = useDispatch<AppDispatch>();

  const onEnabledChange = useCallback(
    (value: boolean) => {
      dispatch(terminalActions.setTerminalState({key: 'enableLigatures', value}));
    },
    [dispatch],
  );

  const titleText = 'Font Ligatures';
  const descriptionText = 'Enable programming ligatures.';

  return (
    <SettingsFilterItem searchTexts={[titleText, descriptionText, 'terminal', 'ligatures', 'font', 'programming']}>
      <LynxSwitch
        size="default"
        title={titleText}
        enabled={enableLigatures}
        description={descriptionText}
        onEnabledChange={onEnabledChange}
      />
    </SettingsFilterItem>
  );
}
