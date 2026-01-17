import {Select, Selection, SelectItem} from '@heroui/react';
import {TerminalCursorInactiveStyle} from '@lynx_cross/types/ipc';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../redux/reducers/terminal';
import {AppDispatch} from '../../../../redux/store';
import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

export default function CursorInactiveStyle() {
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
  const labelText = 'Cursor Inactive Style';
  const descriptionText = 'Select the appearance of cursor when inactive.';

  return (
    <SettingsFilterItem searchTexts={[labelText, descriptionText, 'cursor', 'inactive', 'terminal']}>
      <Select
        className="my-0!"
        labelPlacement="outside"
        onSelectionChange={onChange}
        selectedKeys={[cursorInactiveStyle]}
        label={<SettingsSearchHighlight text={labelText} />}
        description={<SettingsSearchHighlight text={descriptionText} />}
        classNames={{trigger: 'cursor-default transition! duration-300!'}}
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
    </SettingsFilterItem>
  );
}
