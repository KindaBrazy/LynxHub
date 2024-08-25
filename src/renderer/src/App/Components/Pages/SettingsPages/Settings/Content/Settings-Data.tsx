import {Button} from '@nextui-org/react';
import {message} from 'antd';
import {useCallback, useEffect, useState} from 'react';

import {getIconByName} from '../../../../../../assets/icons/SvgIconsContainer';
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
    <SettingsSection title="Data" icon="Database" id={SettingsDataId} itemsCenter>
      <span>App data, including modules and binaries, will be saved here.</span>

      <Button variant="light" onPress={openFolder} endContent={getIconByName('OpenFolder')}>
        {currentPath}
      </Button>

      <Button radius="sm" variant="faded" onPress={change} className="cursor-default" fullWidth>
        Change (Restart)
      </Button>
    </SettingsSection>
  );
}
