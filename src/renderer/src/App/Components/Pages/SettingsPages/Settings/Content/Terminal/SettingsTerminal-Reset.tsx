import {Button} from '@heroui/react';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {RefreshDuo_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import {terminalActions} from '../../../../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsTerminalReset() {
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
    <SettingsFilterItem searchTexts={['Reset to Defaults', 'reset terminal', 'defaults', 'terminal settings']}>
      <Button onPress={onApply} isLoading={isSaving} startContent={<RefreshDuo_Icon />} fullWidth>
        Reset to Defaults
      </Button>
    </SettingsFilterItem>
  );
}
