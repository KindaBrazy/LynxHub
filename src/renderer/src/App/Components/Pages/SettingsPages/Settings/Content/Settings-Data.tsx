import {Button} from '@mantine/core';
import {Button as NextButton} from '@nextui-org/react';
import {message} from 'antd';
import {useCallback, useEffect, useState} from 'react';

import {Database_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons3';
import {OpenFolder_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons4';
import rendererIpc from '../../../../../RendererIpc';
import SettingsSection from '../SettingsPage-ContentSection';

export const SettingsDataId = 'settings_data_elem';

/** Change app data directory */
export default function SettingsData() {
  const [currentPath, setCurrentPath] = useState<string>('');

  const change = () => {
    message.loading({content: 'Selecting folder for data...', key: 'select-app-data', duration: 0});
    rendererIpc.appData
      .selectAnother()
      .then(() => {
        message.destroy('select-app-data');
        message.success('Folder selected successfully! Restarting...');
      })
      .catch(e => {
        message.destroy('select-app-data');
        message.error('An error occurred while selecting the folder.');
        console.log(e);
      });
  };

  const openFolder = useCallback(() => {
    rendererIpc.file.openPath(currentPath);
  }, [currentPath]);

  useEffect(() => {
    rendererIpc.appData.getCurrentPath().then(result => {
      setCurrentPath(result);
    });
  }, []);

  return (
    <SettingsSection title="Data" id={SettingsDataId} icon={<Database_Icon className="size-5" />} itemsCenter>
      <span>App data, including modules and binaries, will be saved here.</span>

      <NextButton radius="sm" variant="light" onPress={openFolder} endContent={<OpenFolder_Icon />}>
        {currentPath}
      </NextButton>

      <Button
        radius="md"
        onClick={change}
        variant="default"
        className="!cursor-default !transition !duration-300"
        fullWidth>
        Change (Restart)
      </Button>
    </SettingsSection>
  );
}
