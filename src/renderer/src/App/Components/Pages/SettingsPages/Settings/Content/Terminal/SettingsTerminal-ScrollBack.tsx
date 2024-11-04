import {InputNumber} from 'antd';
import {isNull} from 'lodash';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../../../Redux/App/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';

export default function SettingsTerminalScrollBack() {
  const scrollBack = useTerminalState('scrollBack');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = useCallback((value: number | null) => {
    if (!isNull(value)) {
      dispatch(terminalActions.setTerminalState({key: 'scrollBack', value}));
    }
  }, []);

  return (
    <InputNumber
      min={100}
      step={1000}
      max={999999}
      className="w-full"
      value={scrollBack}
      onChange={onChange}
      addonBefore="Scrollback"
    />
  );
}
