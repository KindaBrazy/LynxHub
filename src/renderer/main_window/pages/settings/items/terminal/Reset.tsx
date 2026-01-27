import {Button} from '@heroui/react';
import {terminalActions} from '@lynx/redux/reducers/terminal';
import {AppDispatch} from '@lynx/redux/store';
import {Refresh} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';

export default function Reset() {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();

  const onApply = useCallback(() => {
    const fakeDelay = 300;
    setIsSaving(true);

    dispatch(terminalActions.resetToDefaults());
    setTimeout(() => {
      setIsSaving(false);
    }, fakeDelay);
  }, []);

  return (
    <SettingsFilterItem
      searchTexts={[
        'Reset all terminal settings',
        'reset terminal',
        'defaults',
        'terminal settings',
        'reset quick commands',
      ]}>
      <Button
        variant="flat"
        color="warning"
        onPress={onApply}
        isLoading={isSaving}
        startContent={<Refresh />}
        fullWidth>
        Reset All Terminal Settings
      </Button>
    </SettingsFilterItem>
  );
}
