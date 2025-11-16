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
            <div key={`terminal_quick_command_${slot}`} className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Input
                size="sm"
                label={`Quick Command ${slot} Label`}
                value={item.label}
                onValueChange={value => updateQuickCommands(index, {label: value})}
              />
              <Input
                size="sm"
                label={`Quick Command ${slot}`}
                value={item.command}
                onValueChange={value => updateQuickCommands(index, {command: value})}
              />
            </div>
          );
        })}
      </div>
    </SettingsFilterItem>
  );
}

