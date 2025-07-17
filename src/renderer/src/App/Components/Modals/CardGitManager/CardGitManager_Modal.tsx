import {Button, CircularProgress, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {Divider} from 'antd';
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {RepositoryInfo} from '../../../../../../cross/CrossTypes';
import {useDebounceBreadcrumb} from '../../../../../Breadcrumbs';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {modalActions, useModalsState} from '../../../Redux/Reducer/ModalsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {REMOVE_MODAL_DELAY} from '../../../Utils/Constants';
import {lynxTopToast} from '../../../Utils/UtilHooks';
import Branches from './Branches';
import CommitInfo from './CommitInfo';
import Reset_Shallow from './Reset_Shallow';

type Props = {isOpen: boolean; tabID: string; title: string; dir: string};

function CardGitManager_Modal({isOpen, dir, title, tabID}: Props) {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

  const [repoInfo, setRepoInfo] = useState<RepositoryInfo | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useDebounceBreadcrumb('Card Git Manager Modal: ', [isOpen, title]);

  useEffect(() => {
    if (!isOpen) {
      setRepoInfo(undefined);
    }
  }, [isOpen]);

  const getRepoInfo = useCallback(() => {
    setLoading(true);
    rendererIpc.git
      .getRepoInfo(dir)
      .then(repositoryInfo => {
        setRepoInfo(repositoryInfo);
      })
      .catch(e => {
        lynxTopToast(dispatch).error('Something went wrong while getting the repository info.');
        console.error(e);
      })
      .finally(() => setLoading(false));
  }, [dir]);

  useEffect(() => {
    if (dir) getRepoInfo();
  }, [isOpen, dir]);

  const onOpenChange = useCallback(() => {
    dispatch(modalActions.closeGitManager({tabID: activeTab}));
    setTimeout(() => {
      dispatch(modalActions.removeGitManager({tabID: activeTab}));
    }, REMOVE_MODAL_DELAY);
  }, [dispatch]);

  const show = useMemo(() => (activeTab === tabID ? 'flex' : 'hidden'), [activeTab, tabID]);

  return (
    <Modal
      size="3xl"
      isOpen={isOpen}
      backdrop="blur"
      placement="center"
      isDismissable={false}
      scrollBehavior="inside"
      onOpenChange={onOpenChange}
      classNames={{backdrop: `!top-10 ${show}`, closeButton: 'cursor-default', wrapper: `!top-10 ${show}`}}
      hideCloseButton>
      <ModalContent className="overflow-hidden">
        <ModalHeader
          className={
            'shrink-0 items-center overflow-hidden bg-foreground-200' + ' flex-col shadow-md dark:bg-foreground-100'
          }>
          <span className="text-lg font-semibold">{title}</span>
          {repoInfo && (
            <Link className="cursor-pointer" onPress={() => window.open(repoInfo.remoteUrl)}>
              {repoInfo.remoteUrl}
            </Link>
          )}
        </ModalHeader>
        <ModalBody className="py-8 scrollbar-hide">
          {loading ? (
            <div className="size-full flex justify-center my-6">
              <CircularProgress size="lg" label="Gathering the repository intel, one moment!" />
            </div>
          ) : (
            <div className="space-y-8 size-full">
              {repoInfo && (
                <>
                  <Branches
                    dir={dir}
                    refreshData={getRepoInfo}
                    currentBranch={repoInfo.currentBranch}
                    availableBranches={repoInfo.availableBranches}
                  />

                  <Reset_Shallow dir={dir} title={title} refreshData={getRepoInfo} isShallow={repoInfo.isShallow} />

                  <Divider variant="dashed" />
                  <CommitInfo repoInfo={repoInfo} />
                </>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" color="warning" onPress={onOpenChange} className="cursor-default">
            <span className="font-semibold">Close</span>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

const GitManagerModal = () => {
  const GitManagerExt = useMemo(() => extensionsData.replaceModals.gitManager, []);

  const gitManager = useModalsState('gitManager');

  return (
    <>
      {gitManager.map(modal => (
        <Fragment key={`${modal.tabID}_modal`}>
          {GitManagerExt ? <GitManagerExt /> : <CardGitManager_Modal {...modal} />}
        </Fragment>
      ))}
    </>
  );
};

export default GitManagerModal;
