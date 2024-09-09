import {Button, Checkbox, CheckboxGroup} from '@nextui-org/react';
import {message} from 'antd';
import {useCallback, useEffect, useState} from 'react';

import {APP_NAME} from '../../../../../../../../cross/CrossConstants';
import {DiscordRPC} from '../../../../../../../../cross/CrossTypes';
import rendererIpc from '../../../../../RendererIpc';
import SettingsSection from '../SettingsPage-ContentSection';

export const SettingsDiscordId = 'settings_discord_elem';

/** Discord status activity */
export default function SettingsDiscord() {
  const [selectedLynx, setSelectedLynx] = useState<string[]>([]);
  const [selectedAI, setSelectedAI] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('app').then(app => {
      const lynx = Object.entries(app.discordRP.LynxHub)
        .filter(([, value]) => value)
        .map(([key]) => key);

      const ai = Object.entries(app.discordRP.RunningAI)
        .filter(([, value]) => value)
        .map(([key]) => key);

      setSelectedLynx(lynx);
      setSelectedAI(ai);
    });
  }, []);

  const onApply = useCallback(() => {
    const fakeDelay = 300;
    setIsSaving(true);
    const discordRPC: DiscordRPC = {
      LynxHub: {
        Enabled: selectedLynx.includes('Enabled'),
        TimeElapsed: selectedLynx.includes('TimeElapsed'),
      },
      RunningAI: {
        Enabled: selectedAI.includes('Enabled'),
        TimeElapsed: selectedAI.includes('TimeElapsed'),
        AIName: selectedAI.includes('AIName'),
      },
    };
    rendererIpc.win.setDiscordRP(discordRPC);
    setTimeout(() => {
      message.success('Done!');
      setIsSaving(false);
    }, fakeDelay);
  }, [selectedLynx, selectedAI]);

  return (
    <>
      <SettingsSection icon="Discord" id={SettingsDiscordId} title="Discord Activity Status">
        <CheckboxGroup
          color="secondary"
          value={selectedLynx}
          orientation="horizontal"
          onValueChange={setSelectedLynx}
          description={`Display running ${APP_NAME} in Discord activity status`}>
          <Checkbox value="Enabled" className="cursor-default">
            {APP_NAME}
          </Checkbox>
          <Checkbox value="TimeElapsed" className="cursor-default" isDisabled={!selectedLynx.includes('Enabled')}>
            Time Elapsed
          </Checkbox>
        </CheckboxGroup>
        <CheckboxGroup
          color="secondary"
          value={selectedAI}
          orientation="horizontal"
          onValueChange={setSelectedAI}
          description="Display running AI in Discord activity status">
          <Checkbox value="Enabled" className="cursor-default">
            Running AI
          </Checkbox>
          <Checkbox value="TimeElapsed" className="cursor-default" isDisabled={!selectedAI.includes('Enabled')}>
            Time Elapsed
          </Checkbox>
          <Checkbox value="AIName" className="cursor-default" isDisabled={!selectedAI.includes('Enabled')}>
            AI Name
          </Checkbox>
        </CheckboxGroup>

        <Button variant="faded" onPress={onApply} isLoading={isSaving} className="mt-4 cursor-default">
          {!isSaving && 'Apply'}
        </Button>
      </SettingsSection>
    </>
  );
}