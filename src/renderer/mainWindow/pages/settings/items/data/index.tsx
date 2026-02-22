import {Button} from '@heroui/react';
import SettingsSection from '@lynx/components/SettingsSection';
import {AppDispatch} from '@lynx/redux/store';
import {lynxTopToast} from '@lynx/utils/hooks';
import applicationIpc from '@lynx_shared/ipc/application';
import filesIpc from '@lynx_shared/ipc/files';
import {Database, MoveToFolder, Repeat} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import SettingsSearchHighlight from '../../SettingsSearchHighlight';

export const SettingsDataId = 'settings_data_elem';

/** Change app data directory */
export default function SettingsData() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();

  const change = () => {
    applicationIpc.invoke
      .selectAnotherDataPath()
      .then(result => {
        lynxTopToast(dispatch).success(result);
      })
      .catch(reason => {
        const errorMessage = reason instanceof Error ? reason.message : String(reason);
        lynxTopToast(dispatch).error(errorMessage);
      });
  };

  const openFolder = useCallback(() => {
    filesIpc.openPath(currentPath);
  }, [currentPath]);

  useEffect(() => {
    applicationIpc.invoke.getCurrentDataPath().then(result => {
      setCurrentPath(result);
    });
  }, []);

  return (
    <SettingsSection title="Data" id={SettingsDataId} icon={<Database className="size-5" />} itemsCenter>
      <span>
        <SettingsSearchHighlight text="App data, including extensions, modules and binaries, will be saved here." />
      </span>

      <Button variant="flat" onPress={openFolder} startContent={<MoveToFolder />}>
        {currentPath}
      </Button>

      <Button variant="flat" color="warning" onPress={change} startContent={<Repeat />}>
        <SettingsSearchHighlight text="Change (Restart Required)" />
      </Button>
    </SettingsSection>
  );
}
