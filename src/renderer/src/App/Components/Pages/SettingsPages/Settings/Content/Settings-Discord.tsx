import {Button, Checkbox, CheckboxGroup} from '@heroui/react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {APP_NAME} from '../../../../../../../../cross/CrossConstants';
import {DiscordRPC} from '../../../../../../../../cross/CrossTypes';
import {Discord_Icon, DiskDuo_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {lynxTopToast} from '../../../../../Utils/UtilHooks';
import SettingsSection from '../SettingsPage-ContentSection';

export const SettingsDiscordId = 'settings_discord_elem';

/** Discord status activity */
export default function SettingsDiscord() {
  const [selectedLynx, setSelectedLynx] = useState<string[]>([]);
  const [selectedAI, setSelectedAI] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();

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
      lynxTopToast(dispatch).success('Done!');
      setIsSaving(false);
    }, fakeDelay);
  }, [selectedLynx, selectedAI]);

  return (
    <>
      <SettingsSection
        id={SettingsDiscordId}
        title="Discord Activity Status"
        icon={<Discord_Icon className="size-5" />}>
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

        <Button onPress={onApply} isLoading={isSaving} startContent={<DiskDuo_Icon />}>
          Apply
        </Button>
      </SettingsSection>
    </>
  );
}
