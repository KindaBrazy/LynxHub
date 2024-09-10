import {Select} from '@mantine/core';
import {isEmpty} from 'lodash';
import {Fragment, useEffect, useState} from 'react';

import {useModalsState} from '../../../../Redux/AI/ModalsReducer';
import rendererIpc from '../../../../RendererIpc';
import LaunchConfigSection from '../LaunchConfig-Section';

export default function CustomRunBehavior() {
  const {id} = useModalsState('cardLaunchConfig');

  const [terminalValue, setTerminalValue] = useState<string>('runScript');
  const [browserValue, setBrowserValue] = useState<string>('appBrowser');

  const onTerminalChange = (value: string | null) => {
    if (value) {
      setTerminalValue(value);
      rendererIpc.storageUtils.updateCustomRunBehavior({
        cardID: id,
        terminal: value,
        browser: browserValue,
      });
    }
  };

  const onBrowserChange = (value: string | null) => {
    if (value) {
      setBrowserValue(value);
      rendererIpc.storageUtils.updateCustomRunBehavior({
        cardID: id,
        terminal: terminalValue,
        browser: value,
      });
    }
  };

  useEffect(() => {
    rendererIpc.storage.get('cardsConfig').then(result => {
      if (!isEmpty(result.customRunBehavior)) {
        const data = result.customRunBehavior.find(customRun => customRun.cardID === id);
        if (data) {
          console.log('data', data);
          setBrowserValue(data.browser);
          setTerminalValue(data.terminal);
        }
      }
    });
  }, [setTerminalValue, setBrowserValue, id]);

  return (
    <LaunchConfigSection title="Launch Behavior" customButton={<Fragment />}>
      <div className="space-y-4">
        <div className="flex w-full flex-row items-center space-x-2">
          <Select
            data={[
              {value: 'runScript', label: 'Run Script (e.g. webui.bat)'},
              {value: 'empty', label: 'Open Empty Terminal (No command)'},
            ]}
            radius="md"
            label="Terminal"
            variant="filled"
            className="w-full"
            value={terminalValue}
            onChange={onTerminalChange}
            comboboxProps={{transitionProps: {transition: 'fade', duration: 200}, radius: 'md'}}
          />
        </div>
        <div className="flex w-full flex-row items-center space-x-2">
          <Select
            data={[
              {value: 'appBrowser', label: 'Open In-App Browser (From Terminal)'},
              {value: 'defaultBrowser', label: 'Open Default Browser (From Terminal)'},
              {value: 'doNothing', label: 'Do Nothing'},
            ]}
            radius="md"
            label="Browser"
            variant="filled"
            className="w-full"
            value={browserValue}
            onChange={onBrowserChange}
            comboboxProps={{transitionProps: {transition: 'fade', duration: 200}, radius: 'md'}}
          />
        </div>
      </div>
    </LaunchConfigSection>
  );
}
