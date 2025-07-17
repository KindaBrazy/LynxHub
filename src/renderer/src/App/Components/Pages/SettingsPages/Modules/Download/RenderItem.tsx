import {Button, Chip, Link} from '@heroui/react';
import {Avatar, List} from 'antd';
import {capitalize} from 'lodash';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {ModulesInfo} from '../../../../../../../../cross/CrossTypes';
import {extractGitUrl} from '../../../../../../../../cross/CrossUtils';
import AddBreadcrumb_Renderer from '../../../../../../../Breadcrumbs';
import {Download_Icon, HomeSmile_Icon, Info_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {modalActions} from '../../../../../Redux/Reducer/ModalsReducer';
import {settingsActions} from '../../../../../Redux/Reducer/SettingsReducer';
import {useTabsState} from '../../../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {lynxTopToast} from '../../../../../Utils/UtilHooks';
import SecurityWarning from '../../SecurityWarning';
import ModuleInfo from '../ModuleInfo';

type Props = {
  item: ModulesInfo;
  addModule: (id: string) => void;
};

/** Render available modules to install. */
export default function RenderItem({item, addModule}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');

  const [installing, setInstalling] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isSecOpen, setIsSecOpen] = useState<boolean>(false);

  const install = useCallback(() => {
    AddBreadcrumb_Renderer(`Module install: ${item.id} - (not installed)`);
    setInstalling(true);
    rendererIpc.module.installModule(item.repoUrl).then(result => {
      setInstalling(false);
      if (result) {
        lynxTopToast(dispatch).success(`${item.title} Installed successfully!`);

        dispatch(settingsActions.addNewModule(item.id));
        addModule(item.id);
      } else {
        lynxTopToast(dispatch).error(`Something went wrong while installing ${item.title}.`);
      }
    });
  }, [item.repoUrl, item.title, item.id, dispatch]);

  const handleInstall = () => {
    AddBreadcrumb_Renderer(`Module handleInstall: ${item.id} - (not installed)`);
    setIsSecOpen(true);
  };

  const showInfo = useCallback(() => {
    AddBreadcrumb_Renderer(`Module show info: ${item.id} - (not installed)`);
    setIsDetailsOpen(true);
  }, []);

  const openHomePage = useCallback(() => {
    AddBreadcrumb_Renderer(`Module home page: ${item.id} - (not installed)`);
    dispatch(modalActions.openReadme({url: item.repoUrl, title: item.title, tabID: activeTab}));
  }, [dispatch, item, activeTab]);

  return (
    <>
      <SecurityWarning
        type="module"
        onAgree={install}
        isOpen={isSecOpen}
        title={item.title}
        setIsOpen={setIsSecOpen}
        owner={extractGitUrl(item.repoUrl).owner}
      />
      <ModuleInfo item={item} isOpen={isDetailsOpen} setIsOpen={setIsDetailsOpen} />
      <List.Item
        className={
          'mb-2 rounded-lg border-2 bg-gray-50 !px-2 transition duration-300 hover:bg-gray-200 ' +
          'border-transparent hover:border-white hover:shadow-lg dark:bg-black/15' +
          ' dark:hover:border-black dark:hover:bg-black/25'
        }
        actions={[
          <Button
            size="sm"
            key="install"
            variant="flat"
            color="success"
            isLoading={installing}
            onPress={handleInstall}
            isDisabled={installing}
            startContent={<Download_Icon />}>
            {!installing && 'Install'}
          </Button>,
          <Button
            size="sm"
            key="changelog"
            variant="light"
            onPress={showInfo}
            className="cursor-default"
            startContent={<Info_Icon />}>
            ChangeLog
          </Button>,
        ]}
        key={item.title}>
        <List.Item.Meta
          title={
            <div className="flex items-center justify-between">
              <div className="gap-x-2 flex">
                <Link
                  onPress={() => {
                    window.open(item.repoUrl);
                  }}>
                  {item.title}
                </Link>
                <Chip size="sm" variant="flat">
                  V{item.version}
                </Chip>
                <Chip size="sm" variant="flat">
                  {capitalize(extractGitUrl(item.repoUrl).owner)}
                </Chip>
                {item.owner && (
                  <Chip size="sm" variant="flat" color="success">
                    Owner
                  </Chip>
                )}
              </div>
              <div>
                <Button size="sm" variant="light" className="z-20" onPress={openHomePage} isIconOnly>
                  <HomeSmile_Icon className="size-3.5" />
                </Button>
              </div>
            </div>
          }
          className="!items-center"
          description={item.description}
          avatar={item.logoUrl && <Avatar size={65} src={item.logoUrl} className="shadow-md" />}
        />
      </List.Item>
    </>
  );
}
