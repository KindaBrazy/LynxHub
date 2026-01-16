import {Button} from '@heroui/react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Database_Icon, OpenFolder_Icon, Refresh_Icon} from '../../../../../shared/assets/icons';
import SettingsSection from '../../../../components/ContentSection';
import {lynxTopToast} from '../../../../hooks/utils';
import {AppDispatch} from '../../../../redux/store';
import rendererIpc from '../../../../services/RendererIpc';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

export const SettingsDataId = 'settings_data_elem';

/** Change app data directory */
export default function SettingsData() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();

  const change = () => {
    rendererIpc.appData
      .selectAnother()
      .then(result => {
        lynxTopToast(dispatch).success(result);
      })
      .catch(reason => {
        const errorMessage = reason instanceof Error ? reason.message : String(reason);
        lynxTopToast(dispatch).error(errorMessage);
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
      <span>
        <SettingsSearchHighlight text="App data, including extensions, modules and binaries, will be saved here." />
      </span>

      <Button variant="flat" onPress={openFolder} startContent={<OpenFolder_Icon />}>
        {currentPath}
      </Button>

      <Button onPress={change} startContent={<Refresh_Icon />}>
        <SettingsSearchHighlight text="Change (Restart Required)" />
      </Button>
    </SettingsSection>
  );
}
