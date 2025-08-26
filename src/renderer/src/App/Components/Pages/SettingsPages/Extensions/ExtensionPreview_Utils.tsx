import {Button, Chip, Tab, Tabs, User} from '@heroui/react';
import {Divider, Modal} from 'antd';
import {isNil} from 'lodash';
import {Dispatch, Key, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {ChangelogItem, Extension_ListData} from '../../../../../../../cross/CrossTypes';
import AddBreadcrumb_Renderer, {useDebounceBreadcrumb} from '../../../../../../Breadcrumbs';
import {ExternalDuo_Icon} from '../../../../../../context_menu/Components/SvgIcons';
import {
  BoxDuo_Icon,
  CalendarDuo_Icon,
  Download2_Icon,
  HomeSmile_Icon,
  Info_Icon,
  ListCheck_Icon,
  Refresh3_Icon,
  Trash_Icon,
  UserDuo_Icon,
} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import {settingsActions, useSettingsState} from '../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import {isLinuxPortable, lynxTopToast} from '../../../../Utils/UtilHooks';
import LynxScroll from '../../../Reusable/LynxScroll';
import MarkdownViewer from '../../../Reusable/MarkdownViewer';
import SecurityWarning from '../SecurityWarning';
import {InstalledExt} from './ExtensionsPage';

export function PreviewHeader({
  selectedExt,
  installedExt,
  setInstalled,
}: {
  selectedExt: Extension_ListData | undefined;
  installedExt: InstalledExt | undefined;
  setInstalled: Dispatch<SetStateAction<InstalledExt[]>>;
}) {
  return (
    <div className="w-full flex sm:flex-col lg:flex-row p-5 sm:gap-y-2 shrink-0">
      <div className="w-full flex flex-col">
        <User
          description={
            <div className="flex flex-row gap-x-2 items-center">
              <Chip
                size="sm"
                variant="light"
                className="text-foreground-600"
                startContent={<BoxDuo_Icon className="size-3.5" />}>
                {installedExt?.version || selectedExt?.version}
              </Chip>
              <Chip
                size="sm"
                variant="light"
                className="text-foreground-600"
                startContent={<CalendarDuo_Icon className="size-3.5" />}>
                {selectedExt?.updateDate}
              </Chip>
            </div>
          }
          className="self-start"
          avatarProps={{src: selectedExt?.avatarUrl, className: 'bg-opacity-0', radius: 'none'}}
          name={<span className="font-semibold text-foreground text-xl">{selectedExt?.title}</span>}
        />
        <div className="flex flex-row items-center ml-12">
          <Chip variant="light" startContent={<UserDuo_Icon />}>
            {selectedExt?.developer}
          </Chip>
          <Button
            onPress={() => {
              AddBreadcrumb_Renderer(`Extension homepage: id:${selectedExt?.id}`);
              window.open(selectedExt?.url);
            }}
            size="sm"
            variant="light"
            startContent={<HomeSmile_Icon />}
            className="text-small text-primary-500"
            endContent={<ExternalDuo_Icon className="size-3" />}>
            Home Page
          </Button>
        </div>
      </div>

      <ActionButtons selectedExt={selectedExt} installed={!!installedExt} setInstalled={setInstalled} />
    </div>
  );
}

const renderChangelogItem = (item: ChangelogItem, depth = 0) => (
  <div key={item.label} className={`${depth > 0 ? 'ml-4 mt-1' : 'mt-2'}`}>
    <div className="flex items-start gap-2">
      <div
        className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${depth > 0 ? 'bg-foreground-400' : 'bg-blue-500'}`}
      />
      <span className={`text-sm leading-relaxed text-foreground-600`}>{item.label}</span>
    </div>
    {item.subitems && (
      <div className="mt-1">{item.subitems.map(subitem => renderChangelogItem(subitem, depth + 1))}</div>
    )}
  </div>
);

export function PreviewBody({
  selectedExt,
  installed,
}: {
  selectedExt: Extension_ListData | undefined;
  installed: boolean;
}) {
  const [currentTab, setCurrentTab] = useState<Key>('changelog');

  useDebounceBreadcrumb('Extension tab', [currentTab]);

  useEffect(() => {
    setCurrentTab(installed ? 'changelog' : 'readme');
  }, [installed]);

  const ReplaceMd = useMemo(() => extensionsData.replaceMarkdownViewer, []);

  return (
    <div className="w-full flex flex-col overflow-hidden">
      <Tabs
        variant="light"
        color="primary"
        className="mb-2 ml-2"
        onSelectionChange={setCurrentTab}
        selectedKey={currentTab.toString()}>
        <Tab
          title={
            <div className="flex flex-row items-center gap-x-2">
              <Info_Icon />
              <span>Readme</span>
            </div>
          }
          key={'readme'}
        />
        <Tab
          title={
            <div className="flex flex-row items-center gap-x-2">
              <ListCheck_Icon />
              <span>Changelog</span>
            </div>
          }
          key={'changelog'}
        />
      </Tabs>
      {currentTab === 'readme' &&
        (isNil(ReplaceMd) ? (
          <MarkdownViewer repoUrl={selectedExt?.url || ''} />
        ) : (
          <ReplaceMd repoPath={selectedExt?.url || ''} />
        ))}
      {currentTab === 'changelog' && (
        <LynxScroll className="gap-y-6 ml-6 py-2 flex flex-col mr-4">
          {selectedExt?.changeLog.map((version, index) => (
            <div key={`${version}_${index}_changeItem`}>
              <div
                className={
                  `border-l-4 pl-4 mt-6 transition-all duration-300 hover:-translate-x-2 ` +
                  `${index === 0 ? 'border-secondary' : 'border-default'}`
                }
                key={index}>
                <h3 className={`text-lg font-semibold mb-3 transition-colors duration-200`}>{version.title}</h3>
                <div className="space-y-1">
                  {version.items.map((item, itemIndex) => (
                    <div key={itemIndex}>{renderChangelogItem(item)}</div>
                  ))}
                </div>
              </div>
              {index === 0 && <Divider />}
            </div>
          ))}
        </LynxScroll>
      )}
    </div>
  );
}

function ActionButtons({
  installed,
  selectedExt,
  setInstalled,
}: {
  installed: boolean;
  selectedExt: Extension_ListData | undefined;
  setInstalled: Dispatch<SetStateAction<InstalledExt[]>>;
}) {
  const updateAvailable = useSettingsState('extensionsUpdateAvailable');
  const dispatch = useDispatch<AppDispatch>();

  const [updating, setUpdating] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);
  const [uninstalling, setUninstalling] = useState<boolean>(false);

  const [isCompatible, setIsCompatible] = useState<boolean>(true);
  const [isSecOpen, setIsSecOpen] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.win.getSystemInfo().then(result => {
      setIsCompatible(selectedExt?.platforms.includes(result.os) || false);
    });
  }, [selectedExt]);

  const later = useCallback(() => {
    Modal.destroyAll();
  }, []);

  const restart = useCallback(() => {
    Modal.destroyAll();
    rendererIpc.win.changeWinState('restart');
  }, []);

  const close = useCallback(() => {
    Modal.destroyAll();
    rendererIpc.win.changeWinState('close');
  }, []);

  const showRestartModal = useCallback((message: string) => {
    Modal.warning({
      title: 'Restart Required',
      content: message,
      footer: (
        <div className="mt-6 flex w-full flex-row justify-between">
          <Button size="sm" variant="flat" color="warning" onPress={later}>
            Restart Later
          </Button>
          <Button size="sm" color="success" onPress={isLinuxPortable ? close : restart}>
            {isLinuxPortable ? 'Exit Now' : 'Restart Now'}
          </Button>
        </div>
      ),
      centered: true,
      maskClosable: false,
      rootClassName: 'scrollbar-hide',
      styles: {mask: {top: '2.5rem'}},
      wrapClassName: 'mt-10',
    });
  }, []);

  const updateExtension = useCallback(() => {
    AddBreadcrumb_Renderer(`Extension update: id:${selectedExt?.id}`);
    setUpdating(true);
    if (selectedExt?.id) {
      rendererIpc.extension.updateExtension(selectedExt.id).then(updated => {
        if (updated) {
          lynxTopToast(dispatch).success(`${selectedExt.title} updated successfully`);
          dispatch(settingsActions.removeExtUpdateAvailable(selectedExt.id));
          showRestartModal('To apply the updates to the extension, please restart the app.');
        }
        setUpdating(false);
      });
    }
  }, [selectedExt, showRestartModal]);

  const installExtension = useCallback(() => {
    AddBreadcrumb_Renderer(`Extension install: id:${selectedExt?.id}`);
    setInstalling(true);

    if (selectedExt?.url) {
      rendererIpc.extension.installExtension(selectedExt.url).then(result => {
        setInstalling(false);
        if (result) {
          lynxTopToast(dispatch).success(`${selectedExt.title} installed successfully`);
          showRestartModal('To apply the installed extension, please restart the app.');
          setInstalled(prevState => [...prevState, {id: selectedExt.id, version: selectedExt.version, dir: ''}]);
        }
      });
    }
  }, [selectedExt, showRestartModal]);

  const uninstallExtension = useCallback(() => {
    AddBreadcrumb_Renderer(`Extension uninstall: id:${selectedExt?.id}`);
    setUninstalling(true);

    if (selectedExt?.id) {
      rendererIpc.extension.uninstallExtension(selectedExt.id).then(result => {
        setUninstalling(false);
        if (result) {
          lynxTopToast(dispatch).success(`${selectedExt.title} uninstalled successfully`);
          showRestartModal('To complete the uninstallation of the extension, please restart the app.');
        }
        setInstalled(prevState => prevState.filter(item => item.id !== selectedExt.id));
      });
    }
  }, [selectedExt, showRestartModal]);

  const handleInstall = () => {
    AddBreadcrumb_Renderer(`Extension handleInstall: id:${selectedExt?.id}`);
    setIsSecOpen(true);
  };

  return (
    <>
      <SecurityWarning
        type="extension"
        isOpen={isSecOpen}
        setIsOpen={setIsSecOpen}
        onAgree={installExtension}
        title={selectedExt?.title}
        owner={selectedExt?.developer}
      />
      <div className="flex flex-row items-center gap-x-2">
        {updateAvailable.includes(selectedExt?.id || '') && (
          <Button
            size="sm"
            color="warning"
            isLoading={updating}
            onPress={updateExtension}
            startContent={!updating && <Refresh3_Icon />}>
            {updating ? 'Updating...' : 'Update'}
          </Button>
        )}
        {installed ? (
          <Button
            size="sm"
            color="danger"
            isLoading={uninstalling}
            onPress={uninstallExtension}
            startContent={!uninstalling && <Trash_Icon />}>
            {uninstalling ? 'Uninstalling...' : 'Uninstall'}
          </Button>
        ) : (
          <Button
            size="sm"
            isLoading={installing}
            onPress={handleInstall}
            isDisabled={!isCompatible}
            color={isCompatible ? 'success' : 'warning'}
            startContent={!installing && <Download2_Icon />}>
            {!isCompatible ? 'Not Compatible' : installing ? 'Installing...' : 'Install'}
          </Button>
        )}
      </div>
    </>
  );
}
