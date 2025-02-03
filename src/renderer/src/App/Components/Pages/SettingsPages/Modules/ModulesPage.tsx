import {Button, Tab, Tabs} from '@heroui/react';
import {Key, useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Download2_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons1';
import {settingsActions, useSettingsState} from '../../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import Page from '../../Page';
import DownloadModules from './Download/DownloadModules';
import InstalledModules from './Installed/InstalledModules';

export const modulesRoutePath: string = '/modulesPage';
export const modulesElementId: string = 'modulesElement';

/** Manage app modules -> install, uninstall or update */
export default function ModulesPage() {
  const [installedModules, setInstalledModules] = useState<string[]>([]);
  const [updatingAll, setUpdatingAll] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<Key>('installed-tab');
  const updateAvailable = useSettingsState('moduleUpdateAvailable');
  const dispatch = useDispatch<AppDispatch>();

  const handleUpdateAll = useCallback(() => {
    setUpdatingAll(true);
    rendererIpc.module.updateAllModules().then(() => {
      setUpdatingAll(false);
      dispatch(settingsActions.setSettingsState({key: 'moduleUpdateAvailable', value: false}));
    });
  }, []);

  return (
    <Page className="pb-14" id={modulesElementId}>
      {currentTab === 'installed-tab' && updateAvailable && (
        <Button
          size="sm"
          variant="flat"
          color="success"
          onPress={handleUpdateAll}
          startContent={<Download2_Icon />}
          className="absolute bottom-5 right-5">
          Update All
        </Button>
      )}
      <Tabs
        variant="solid"
        color="secondary"
        className="z-10 mb-2"
        onSelectionChange={setCurrentTab}
        selectedKey={currentTab.toString()}
        fullWidth>
        <Tab title="Installed" key={'installed-tab'} className="cursor-default" />
        <Tab title="Download" key={'download-tab'} className="cursor-default" />
      </Tabs>
      <div
        className={
          'flex max-h-full flex-col overflow-hidden rounded-lg bg-default-200 dark:bg-LynxRaisinBlack' +
          ' border-2 border-foreground/5 pr-0.5 transition duration-300'
        }>
        {currentTab === 'installed-tab' && (
          <InstalledModules updatingAll={updatingAll} setInstalledModules={setInstalledModules} />
        )}
        {currentTab === 'download-tab' && <DownloadModules installedModules={installedModules} />}
      </div>
    </Page>
  );
}
