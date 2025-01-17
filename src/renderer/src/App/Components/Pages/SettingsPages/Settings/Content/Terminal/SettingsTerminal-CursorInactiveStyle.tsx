import {Select, Selection, SelectItem} from '@heroui/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {TerminalCursorInactiveStyle} from '../../../../../../../../../cross/IpcChannelAndTypes';
import {terminalActions, useTerminalState} from '../../../../../../Redux/App/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';

export default function SettingsTerminalCursorInactiveStyle() {
  const cursorInactiveStyle = useTerminalState('cursorInactiveStyle');
  const dispatch = useDispatch<AppDispatch>();

  const onChange = useCallback(
    (keys: Selection) => {
      if (keys !== 'all') {
        const value = keys.values().next().value as TerminalCursorInactiveStyle;
        dispatch(terminalActions.setTerminalState({key: 'cursorInactiveStyle', value}));
      }
    },
    [dispatch],
  );
  return (
    <Select
      labelPlacement="outside"
      onSelectionChange={onChange}
      label="Cursor Inactive Style"
      selectedKeys={[cursorInactiveStyle]}
      description="Select the appearance of cursor when inactive."
      classNames={{trigger: 'cursor-default !transition !duration-300'}}
      disallowEmptySelection>
      <SelectItem key="bar" className="cursor-default">
        Bar
      </SelectItem>
      <SelectItem key="block" className="cursor-default">
        Block
      </SelectItem>
      <SelectItem key="underline" className="cursor-default">
        Underline
      </SelectItem>
      <SelectItem key="outline" className="cursor-default">
        Outline
      </SelectItem>
      <SelectItem key="none" className="cursor-default">
        None
      </SelectItem>
    </Select>
  );
}
