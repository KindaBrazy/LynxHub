import { Button } from '@heroui/react';
import SettingsSection from '@lynx/components/SettingsSection';
import { AppDispatch } from '@lynx/redux/store';
import { lynxTopToast } from '@lynx/utils/hooks';
import applicationIpc from '@lynx_shared/ipc/application';
import filesIpc from '@lynx_shared/ipc/files';
import { Database, MoveToFolder, Repeat } from '@solar-icons/react-perf/BoldDuotone';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import SettingsSearchHighlight from '../../SettingsSearchHighlight';

export const SettingsDataId = 'settings_data_elem';

/**
 * Renders the "Data" settings section.
 * Allows the user to view and change the application's root data directory,
 * where files like extensions, modules, and binaries are stored.
 */
export default function SettingsData() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();

  const loadDataPath = async () => {
    try {
      const result = await applicationIpc.invoke.getCurrentDataPath();
      setCurrentPath(result);
    } catch (error) {
      console.error('Failed to load current data path', error);
    }
  };

  useEffect(() => {
    loadDataPath();
  }, []);

  const handleChangeDataPath = async () => {
    try {
      const result = await applicationIpc.invoke.selectAnotherDataPath();
      lynxTopToast(dispatch).success(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      lynxTopToast(dispatch).error(errorMessage);
    }
  };

  const handleOpenFolder = useCallback(() => {
    if (currentPath) {
      filesIpc.openPath(currentPath);
    }
  }, [currentPath]);

  return (
    <SettingsSection title="Data" id={SettingsDataId} icon={<Database className="size-5" />} itemsCenter>
      <span>
        <SettingsSearchHighlight text="App data, including extensions, modules and binaries, will be saved here." />
      </span>

      <Button variant="flat" onPress={handleOpenFolder} startContent={<MoveToFolder />} isDisabled={!currentPath}>
        {currentPath || 'Loading path...'}
      </Button>

      <Button variant="flat" color="warning" onPress={handleChangeDataPath} startContent={<Repeat />}>
        <SettingsSearchHighlight text="Change (Restart Required)" />
      </Button>
    </SettingsSection>
  );
}
