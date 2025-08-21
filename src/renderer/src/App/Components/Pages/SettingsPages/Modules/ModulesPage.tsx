import {Button, Tab, Tabs} from '@heroui/react';
import {isEmpty} from 'lodash';
import {Key, useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Download2_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {settingsActions, useSettingsState} from '../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import Page from '../../Page';
import DownloadModules from './Download/DownloadModules';
import InstalledModules from './Installed/InstalledModules';

type Props = {show: boolean};

export default function ModulesPage({show}: Props) {
  const [installedModules, setInstalledModules] = useState<string[]>([]);
  const [updatingAll, setUpdatingAll] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<Key>('installed');
  const updateAvailable = useSettingsState('moduleUpdateAvailable');
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setCurrentTab(isEmpty(installedModules) ? 'download' : 'installed');
  }, [installedModules]);

  const handleUpdateAll = useCallback(() => {
    setUpdatingAll(true);
    rendererIpc.module.updateAllModules().then(() => {
      setUpdatingAll(false);
      dispatch(settingsActions.setSettingsState({key: 'moduleUpdateAvailable', value: []}));
    });
  }, []);

  useEffect(() => {
    rendererIpc.module.updateAvailableList().then(value => {
      dispatch(settingsActions.setSettingsState({key: 'moduleUpdateAvailable', value}));
    });
  }, []);

  return (
    <Page show={show} className="pb-14">
      {currentTab === 'installed' && !isEmpty(updateAvailable) && (
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
        size="sm"
        variant="solid"
        color="secondary"
        className="z-10 mb-2"
        onSelectionChange={setCurrentTab}
        selectedKey={currentTab.toString()}
        fullWidth>
        <Tab key="installed" title="Installed" className="cursor-default" />
        <Tab key="download" title="Download" className="cursor-default" />
      </Tabs>
      <div
        className={
          'flex max-h-full flex-col overflow-hidden rounded-lg bg-default-200 dark:bg-LynxRaisinBlack' +
          ' border-2 border-foreground/5 pr-0.5 transition duration-300'
        }>
        {currentTab === 'installed' && (
          <InstalledModules updatingAll={updatingAll} setInstalledModules={setInstalledModules} />
        )}
        {currentTab === 'download' && (
          <DownloadModules installedModules={installedModules} setInstalledModules={setInstalledModules} />
        )}
      </div>
    </Page>
  );
}
