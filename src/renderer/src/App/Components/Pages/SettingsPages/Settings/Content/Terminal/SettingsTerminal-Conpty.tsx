import {Select, Selection, SelectItem} from '@nextui-org/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {TerminalUseConpty} from '../../../../../../../../../cross/IpcChannelAndTypes';
import {terminalActions, useTerminalState} from '../../../../../../Redux/App/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';

export default function SettingsTerminalConpty() {
  const useConpty = useTerminalState('useConpty');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = useCallback(
    (keys: Selection) => {
      if (keys !== 'all') {
        const value = keys.values().next().value as TerminalUseConpty;
        dispatch(terminalActions.setTerminalState({key: 'useConpty', value}));
      }
    },
    [dispatch],
  );

  return (
    <Select
      radius="sm"
      labelPlacement="outside"
      selectedKeys={[useConpty]}
      onSelectionChange={onChange}
      label="Use Conpty (Windows)"
      description="Use the ConPTY system on Windows."
      classNames={{trigger: 'cursor-default !transition !duration-300'}}
      disallowEmptySelection>
      <SelectItem key="auto" className="cursor-default">
        Auto
      </SelectItem>
      <SelectItem key="yes" className="cursor-default">
        Yes
      </SelectItem>
      <SelectItem key="no" className="cursor-default">
        No
      </SelectItem>
    </Select>
  );
}
