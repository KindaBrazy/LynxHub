import {InputNumber} from 'antd';
import {isNull} from 'lodash';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';

export default function SettingsTerminalFontSize() {
  const fontSize = useTerminalState('fontSize');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = useCallback((value: number | null) => {
    if (!isNull(value)) {
      dispatch(terminalActions.setTerminalState({key: 'fontSize', value}));
    }
  }, []);
  return (
    <InputNumber
      min={2}
      max={100}
      value={fontSize}
      className="w-full"
      onChange={onChange}
      placeholder="aloooooo"
      addonBefore="Font Size"
    />
  );
}
