import {Button} from '@mantine/core';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {terminalActions} from '../../../../../../Redux/App/TerminalReducer';
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
    <Button
      radius="md"
      variant="default"
      onClick={onApply}
      loading={isSaving}
      className="!cursor-default !transition !duration-300"
      fullWidth>
      Reset to Defaults
    </Button>
  );
}
