import {Button, Chip, Tab, Tabs, User} from '@heroui/react';
import {Divider} from 'antd';
import {isNil} from 'lodash';
import {Dispatch, Key, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extractGitUrl} from '../../../../../../../cross/CrossUtils';
import {getTargetVersion} from '../../../../../../../cross/plugin/CrossPluginUtils';
import {
  ChangelogItem,
  ChangelogSubItem,
  InstalledPlugin,
  PluginAvailableItem,
  PluginUpdateList,
} from '../../../../../../../cross/plugin/PluginTypes';
import AddBreadcrumb_Renderer, {useDebounceBreadcrumb} from '../../../../../../Breadcrumbs';
import {ExternalDuo_Icon} from '../../../../../../context_menu/Components/SvgIcons';
import {
  ArrowDuo_Icon,
  BoxDuo_Icon,
  CalendarDuo_Icon,
  Download2_Icon,
  HomeSmile_Icon,
  Info_Icon,
  ListCheck_Icon,
  Trash_Icon,
  UserDuo_Icon,
} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import {useSettingsState} from '../../../../Redux/Reducer/SettingsReducer';
import {useUserState} from '../../../../Redux/Reducer/UserReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import {lynxTopToast} from '../../../../Utils/UtilHooks';
import LynxScroll from '../../../Reusable/LynxScroll';
import MarkdownViewer from '../../../Reusable/MarkdownViewer';
import SecurityWarning from '../SecurityWarning';
import {useExtensionPageStore} from './ExtensionsPage';
import {ShowRestartModal, UpdateButton} from './PluginElements';
import SelectVersion from './SelectVersion';

export function PreviewHeader({
  selectedExt,
  installedExt,
  setInstalled,
}: {
  selectedExt: PluginAvailableItem | undefined;
  installedExt: InstalledPlugin | undefined;
  setInstalled: Dispatch<SetStateAction<InstalledPlugin[]>>;
}) {
  const updateAvailable = useSettingsState('pluginUpdateAvailableList');
  const updateChannel = useUserState('updateChannel');

  const {currentVersion, targetUpdate, isUpgrade, targetVersion} = useMemo(() => {
    const targetInstallVersion = selectedExt
      ? getTargetVersion(selectedExt?.versioning.versions, updateChannel)
      : undefined;

    const currentVersion = installedExt?.version.version || targetInstallVersion?.version || 'N/A';
    const targetUpdate = updateAvailable.find(update => update.id === selectedExt?.metadata.id);
    const isUpgrade = targetUpdate?.type === 'upgrade';
    const targetVersion = targetUpdate?.version.version;

    return {currentVersion, targetUpdate, isUpgrade, targetVersion};
  }, [installedExt, selectedExt, updateAvailable, updateChannel]);

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
                startContent={<BoxDuo_Icon className="size-3.5" />}
                classNames={{content: 'flex flex-row items-center justify-center gap-x-1'}}>
                <span>v{currentVersion}</span>
                {targetUpdate && (
                  <>
                    <ArrowDuo_Icon className="size-3 rotate-180" />
                    <span className={`${isUpgrade ? 'text-success' : 'text-warning'}`}>v{targetVersion}</span>
                  </>
                )}
              </Chip>
              <Chip
                size="sm"
                variant="light"
                className="text-foreground-600"
                startContent={<CalendarDuo_Icon className="size-3.5" />}>
                {selectedExt?.versioning.changes[0].date}
              </Chip>
            </div>
          }
          className="self-start"
          avatarProps={{src: selectedExt?.icon, className: 'bg-black/0', radius: 'none'}}
          name={<span className="font-semibold text-foreground text-xl">{selectedExt?.metadata.title}</span>}
        />
        <div className="flex flex-row items-center ml-12">
          <Chip variant="light" startContent={<UserDuo_Icon />}>
            {extractGitUrl(selectedExt?.url || '').owner}
          </Chip>
          <Button
            onPress={() => {
              AddBreadcrumb_Renderer(`Extension homepage: id:${selectedExt?.metadata.id}`);
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

      <ActionButtons
        selectedExt={selectedExt}
        installed={!!installedExt}
        targetUpdate={targetUpdate}
        setInstalled={setInstalled}
        currentVersion={currentVersion}
      />
    </div>
  );
}

const renderChangelogEntry = (item: ChangelogSubItem, depth = 0, key: string | number) => {
  // Case 1: The item is a simple string (the final changelog text)
  if (typeof item === 'string') {
    return (
      <div key={key} className={`${depth > 0 ? 'ml-4 mt-1' : 'mt-2'}`}>
        <div className="flex items-start gap-2">
          {/* Use different bullet colors based on nesting depth */}
          <div
            className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${depth > 0 ? 'bg-foreground-400' : 'bg-blue-500'}`}
          />
          <span className="text-sm leading-relaxed text-foreground-600">{item}</span>
        </div>
      </div>
    );
  }

  // Case 2: The item is an object with nested sub-items
  // We iterate over its key-value pairs (e.g., "API Enhancements": [...])
  return (
    <div key={key} className={`${depth > 0 ? 'ml-4' : ''} mt-2`}>
      {Object.entries(item).map(([label, subitems]) => (
        <div key={label}>
          {/* Render the label for the nested group */}
          <div className="text-sm font-medium text-foreground-800">{label}</div>
          {/* Recursively render the subitems within this group, increasing the depth */}
          <div className="mt-1">
            {subitems.map((subitem, index) => renderChangelogEntry(subitem, depth + 1, index))}
          </div>
        </div>
      ))}
    </div>
  );
};

const Changelog = ({items}: {items: ChangelogItem}) => (
  <div className="space-y-4">
    {Object.entries(items).map(([category, entries]) => (
      <div key={category}>
        <h3 className="font-semibold text-base text-foreground-900">{category}</h3>
        <div className="mt-1">
          {entries.map((entry, index) =>
            // Initial call to the recursive renderer starts at depth 0
            renderChangelogEntry(entry, 0, index),
          )}
        </div>
      </div>
    ))}
  </div>
);

export function PreviewBody({
  selectedExt,
  installed,
}: {
  selectedExt: PluginAvailableItem | undefined;
  installed: boolean;
}) {
  const [currentTab, setCurrentTab] = useState<Key>('changelog');

  useDebounceBreadcrumb('Extension tab', [currentTab]);

  useEffect(() => {
    setCurrentTab(installed ? 'changelog' : 'readme');
  }, [installed]);

  const ReplaceMd = useMemo(() => extensionsData.replaceMarkdownViewer, []);

  const rawReadmeUrl = useMemo(() => {
    const repoUrl = selectedExt?.url;
    if (!repoUrl) {
      return '';
    }

    try {
      const {owner, repo} = extractGitUrl(repoUrl);

      if (owner && repo) {
        return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/source/README.md`;
      }
    } catch (error) {
      console.error('Failed to parse repository URL:', repoUrl, error);
    }

    return '';
  }, [selectedExt?.url]);

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
          <MarkdownViewer urlType="raw" url={rawReadmeUrl} />
        ) : (
          <ReplaceMd repoPath={selectedExt?.url || ''} />
        ))}
      {currentTab === 'changelog' && (
        <LynxScroll className="gap-y-6 ml-6 py-2 flex flex-col mr-4">
          {selectedExt?.versioning.changes.map((version, index) => (
            <div key={`${version}_${index}_changeItem`}>
              <div
                className={
                  `border-l-4 pl-4 mt-6 transition-all duration-300 hover:-translate-x-2 ` +
                  `${index === 0 ? 'border-secondary' : 'border-default'}`
                }
                key={index}>
                <h3 className={`text-lg font-semibold mb-3 transition-colors duration-200`}>{version.version}</h3>
                <div className="space-y-1">
                  {version.items.map((item, itemIndex) => (
                    <Changelog items={item} key={`${itemIndex}_changelog`} />
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
  targetUpdate,
  currentVersion,
}: {
  installed: boolean;
  selectedExt: PluginAvailableItem | undefined;
  setInstalled: Dispatch<SetStateAction<InstalledPlugin[]>>;
  targetUpdate: PluginUpdateList | undefined;
  currentVersion: string;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const manageSet = useExtensionPageStore(state => state.manageSet);
  const installing = useExtensionPageStore(state => state.installing);
  const unInstalling = useExtensionPageStore(state => state.unInstalling);

  const isInstalling = useMemo(
    () => installing.has(selectedExt?.metadata.id || ''),
    [installing, selectedExt?.metadata.id],
  );
  const isUnInstalling = useMemo(
    () => unInstalling.has(selectedExt?.metadata.id || ''),
    [unInstalling, selectedExt?.metadata.id],
  );

  const [isCompatible, setIsCompatible] = useState<boolean>(true);
  const [isSecOpen, setIsSecOpen] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.win.getSystemInfo().then(result => {
      setIsCompatible(selectedExt?.metadata.platforms?.includes(result.os) || false);
    });
  }, [selectedExt]);

  const installExtension = useCallback(() => {
    AddBreadcrumb_Renderer(`Extension install: id:${selectedExt?.metadata.id}`);
    manageSet('installing', selectedExt?.metadata.id, 'add');

    if (selectedExt?.url) {
      rendererIpc.plugins.installPlugin(selectedExt.url).then(result => {
        manageSet('installing', selectedExt?.metadata.id, 'remove');
        if (result) {
          lynxTopToast(dispatch).success(`${selectedExt.metadata.title} installed successfully`);
          ShowRestartModal('To apply the installed extension, please restart the app.');
          setInstalled(prevState => [
            ...prevState,
            {
              version: selectedExt.versioning.versions[0],
              metadata: selectedExt.metadata,
              url: selectedExt.url,
              dir: '',
            },
          ]);
        }
      });
    }
  }, [selectedExt]);

  const uninstallExtension = useCallback(() => {
    AddBreadcrumb_Renderer(`Extension uninstall: id:${selectedExt?.metadata.id}`);
    manageSet('unInstalling', selectedExt?.metadata.id, 'add');

    if (selectedExt?.metadata.id) {
      rendererIpc.plugins.uninstallPlugin(selectedExt.metadata.id).then(result => {
        manageSet('unInstalling', selectedExt?.metadata.id, 'remove');
        if (result) {
          lynxTopToast(dispatch).success(`${selectedExt.metadata.title} uninstalled successfully`);
          ShowRestartModal('To complete the uninstallation of the extension, please restart the app.');
        }
        setInstalled(prevState => prevState.filter(item => item.metadata.id !== selectedExt.metadata.id));
      });
    }
  }, [selectedExt]);

  const handleInstall = () => {
    AddBreadcrumb_Renderer(`Extension handleInstall: id:${selectedExt?.metadata.id}`);
    setIsSecOpen(true);
  };

  return (
    <div className="flex flex-col gap-y-1 items-end">
      <SecurityWarning
        type="extension"
        isOpen={isSecOpen}
        setIsOpen={setIsSecOpen}
        onAgree={installExtension}
        title={selectedExt?.metadata.title}
        owner={extractGitUrl(selectedExt?.url || '').owner}
      />
      <SelectVersion selectedExt={selectedExt} targetUpdate={targetUpdate} currentVersion={currentVersion} />
      <div className="flex flex-row items-center gap-x-2">
        <UpdateButton item={selectedExt!} selectedItem={selectedExt} />
        {installed ? (
          <Button
            size="sm"
            color="danger"
            variant="flat"
            isLoading={isUnInstalling}
            onPress={uninstallExtension}
            startContent={!isUnInstalling && <Trash_Icon />}>
            {isUnInstalling ? 'Uninstalling...' : 'Uninstall'}
          </Button>
        ) : (
          <Button
            size="sm"
            onPress={handleInstall}
            isLoading={isInstalling}
            isDisabled={!isCompatible}
            color={isCompatible ? 'success' : 'warning'}
            startContent={!isInstalling && <Download2_Icon />}>
            {!isCompatible ? 'Not Compatible' : isInstalling ? 'Installing...' : 'Install'}
          </Button>
        )}
      </div>
    </div>
  );
}
