import {Input} from '@heroui/react';
import {useDispatch} from 'react-redux';

import {terminalActions, useTerminalState} from '../../../../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import SettingsFilterItem from '../../SettingsFilterItem';

type QuickCommand = {label: string; command: string};

export default function SettingsTerminalQuickCommands() {
  const quickCommands = useTerminalState('quickCommands');
  const dispatch = useDispatch<AppDispatch>();

  const normalized: QuickCommand[] = Array.from({length: 6}, (_, index) => {
    const existing = quickCommands[index];
    if (!existing) return {label: '', command: ''};
    return {label: existing.label || '', command: existing.command || ''};
  });

  const updateQuickCommands = (index: number, patch: Partial<QuickCommand>) => {
    const next = normalized.map((item, i) => (i === index ? {...item, ...patch} : item));
    dispatch(terminalActions.setTerminalState({key: 'quickCommands', value: next}));
  };

  return (
    <SettingsFilterItem
      searchTexts={['terminal', 'quick', 'commands', 'shortcuts', 'terminal quick commands', 'terminal shortcuts']}>
      <div className="flex flex-col gap-y-2">
        {normalized.map((item, index) => {
          const slot = index + 1;
          return (
            <div
              key={`terminal_quick_command_${slot}`}
              className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1.5fr)_minmax(0,2fr)_auto] items-center">
              <Input
                size="sm"
                value={item.label}
                label={`Quick Command ${slot} Label`}
                onValueChange={value => updateQuickCommands(index, {label: value})}
              />
              <Input
                size="sm"
                value={item.command}
                label={`Quick Command ${slot}`}
                onValueChange={value => updateQuickCommands(index, {command: value})}
              />
              <button
                type="button"
                onClick={() => updateQuickCommands(index, {label: '', command: ''})}
                className="text-xs text-danger-500 hover:text-danger-600 justify-self-start md:justify-self-end">
                Clear
              </button>
            </div>
          );
        })}
      </div>
    </SettingsFilterItem>
  );
}
