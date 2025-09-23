import {Button} from '@heroui/react';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {RefreshDuo_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import {terminalActions} from '../../../../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../../../../Redux/Store';

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
    <Button onPress={onApply} isLoading={isSaving} startContent={<RefreshDuo_Icon />} fullWidth>
      Reset to Defaults
    </Button>
  );
}
