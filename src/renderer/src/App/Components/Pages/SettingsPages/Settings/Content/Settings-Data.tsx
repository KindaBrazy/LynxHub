import {Button} from '@heroui/react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Database_Icon, OpenFolder_Icon, Refresh_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {lynxTopToast} from '../../../../../Utils/UtilHooks';
import SettingsSection from '../SettingsPage-ContentSection';

export const SettingsDataId = 'settings_data_elem';

/** Change app data directory */
export default function SettingsData() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();

  const change = () => {
    rendererIpc.appData
      .selectAnother()
      .then(() => {
        lynxTopToast(dispatch).success('Folder selected successfully! Restarting...');
      })
      .catch(() => {
        lynxTopToast(dispatch).error('An error occurred while selecting the folder.');
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
      <span>App data, including extensions, modules and binaries, will be saved here.</span>

      <Button variant="flat" onPress={openFolder} startContent={<OpenFolder_Icon />}>
        {currentPath}
      </Button>

      <Button onPress={change} startContent={<Refresh_Icon />}>
        Change (Restart Required)
      </Button>
    </SettingsSection>
  );
}
