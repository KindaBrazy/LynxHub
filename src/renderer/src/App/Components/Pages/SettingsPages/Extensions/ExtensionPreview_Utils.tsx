import {Button, ButtonGroup, Link, ScrollShadow, Tab, Tabs, User} from '@heroui/react';
import {Divider, Modal} from 'antd';
import {isNil} from 'lodash';
import {Dispatch, Fragment, Key, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Extension_ListData} from '../../../../../../../cross/CrossTypes';
import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import {settingsActions, useSettingsState} from '../../../../Redux/Reducer/SettingsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import {isLinuxPortable, RenderSubItems} from '../../../../Utils/UtilHooks';
import MarkdownViewer from '../../../Reusable/MarkdownViewer';
import SecurityWarning from '../SecurityWarning';
import {InstalledExt} from './ExtensionsPage';

export function PreviewHeader({
  selectedExt,
  installedExt,
}: {
  selectedExt: Extension_ListData | undefined;
  installedExt: InstalledExt | undefined;
}) {
  return (
    <div
      className={
        'absolute inset-x-0 flex flex-col p-4 gap-y-2 top-0 h-[6.3rem]' +
        ' overflow-y-scroll scrollbar-hide bg-white dark:bg-LynxRaisinBlack rounded-xl'
      }>
      <User
        className="self-start"
        avatarProps={{src: selectedExt?.avatarUrl}}
        name={<span className="font-semibold text-foreground text-[1rem]">{selectedExt?.title}</span>}
      />
      <div className="flex flex-row gap-x-2 items-center">
        <span className="text-small">{installedExt?.version || selectedExt?.version}</span>
        <Divider type="vertical" />
        <span className="text-small">{selectedExt?.updateDate}</span>
        <Divider type="vertical" />
        <span className="text-small">{selectedExt?.developer}</span>
        <Divider type="vertical" />
        <Link href={selectedExt?.url} className="text-small text-primary-500" isExternal>
          Home Page
        </Link>
      </div>
    </div>
  );
}

export function PreviewBody({
  selectedExt,
  installed,
}: {
  selectedExt: Extension_ListData | undefined;
  installed: boolean;
}) {
  const [currentTab, setCurrentTab] = useState<Key>('changelog');

  useEffect(() => {
    setCurrentTab(installed ? 'changelog' : 'readme');
  }, [installed]);

  const ReplaceMd = useMemo(() => extensionsData.replaceMarkdownViewer, []);

  return (
    <div className="absolute inset-x-0 top-[7rem] flex flex-col bottom-12">
      <Tabs
        size="sm"
        variant="solid"
        className="mb-2"
        color="secondary"
        onSelectionChange={setCurrentTab}
        selectedKey={currentTab.toString()}
        fullWidth>
        <Tab title="README" key={'readme'} className="cursor-default"></Tab>
        <Tab title="ChangeLog" key={'changelog'} className="cursor-default"></Tab>
      </Tabs>
      {currentTab === 'readme' &&
        (isNil(ReplaceMd) ? (
          <MarkdownViewer repoUrl={selectedExt?.url || ''} />
        ) : (
          <ReplaceMd repoPath={selectedExt?.url || ''} />
        ))}
      {currentTab === 'changelog' && (
        <div className="absolute top-11 bottom-1 inset-x-0 bg-white dark:bg-LynxRaisinBlack rounded-xl">
          <ScrollShadow
            className={'size-full flex flex-col justify-start items-start pt-8 pl-6 gap-y-4 font-Nunito'}
            hideScrollBar>
            {selectedExt?.changeLog.map((item, index) => (
              <Fragment key={`section_${index}`}>
                {/* Changed List to ul here */}
                <ul style={{listStyleType: 'disc'}}>
                  <span className="text-large font-semibold">{item.title}</span>
                  {RenderSubItems(item.items, `section_${index}`)}
                </ul>
                {index < selectedExt?.changeLog.length - 1 && <Divider />}
              </Fragment>
            ))}
          </ScrollShadow>
        </div>
      )}
    </div>
  );
}

export function PreviewFooter({
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
    setUpdating(true);
    if (selectedExt?.id) {
      rendererIpc.extension.updateExtension(selectedExt.id).then(updated => {
        if (updated) {
          dispatch(settingsActions.removeExtUpdateAvailable(selectedExt.id));
          showRestartModal('To apply the updates to the extension, please restart the app.');
        }
        setUpdating(false);
      });
    }
  }, [selectedExt, showRestartModal]);

  const installExtension = useCallback(() => {
    setInstalling(true);

    if (selectedExt?.url) {
      rendererIpc.extension.installExtension(selectedExt.url).then(result => {
        setInstalling(false);
        if (result) {
          showRestartModal('To apply the installed extension, please restart the app.');
          setInstalled(prevState => [...prevState, {id: selectedExt.id, version: selectedExt.version, dir: ''}]);
        }
      });
    }
  }, [selectedExt, showRestartModal]);

  const uninstallExtension = useCallback(() => {
    setUninstalling(true);

    if (selectedExt?.id) {
      rendererIpc.extension.uninstallExtension(selectedExt.id).then(result => {
        setUninstalling(false);
        if (result) {
          showRestartModal('To complete the uninstallation of the extension, please restart the app.');
        }
        setInstalled(prevState => prevState.filter(item => item.id !== selectedExt.id));
      });
    }
  }, [selectedExt, showRestartModal]);

  const handleInstall = () => {
    setIsSecOpen(true);
  };

  return (
    <div className="absolute bottom-0 inset-x-0">
      <SecurityWarning
        type="extension"
        isOpen={isSecOpen}
        setIsOpen={setIsSecOpen}
        onAgree={installExtension}
        title={selectedExt?.title}
        owner={selectedExt?.developer}
      />
      <ButtonGroup variant="flat" fullWidth>
        {installed ? (
          <>
            <Button color="danger" isLoading={uninstalling} onPress={uninstallExtension}>
              Uninstall
            </Button>
            {updateAvailable.includes(selectedExt?.id || '') && (
              <Button color="success" isLoading={updating} onPress={updateExtension}>
                Update
              </Button>
            )}
          </>
        ) : (
          <Button
            isLoading={installing}
            onPress={handleInstall}
            isDisabled={!isCompatible}
            color={isCompatible ? 'success' : 'warning'}>
            {isCompatible ? 'Install' : 'Not Compatible'}
          </Button>
        )}
      </ButtonGroup>
    </div>
  );
}
