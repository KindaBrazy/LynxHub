import {
  Button,
  CircularProgress,
  Divider,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import {RepositoryInfo} from '@lynx_common/types';
import gitIpc from '@lynx_shared/ipc/git';
import {useDebounceBreadcrumb} from '@lynx_shared/sentry/Breadcrumbs';
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';

import {topToast} from '../../../../layouts/ToastProviders';
import {extensionsData} from '../../../../plugins/extensions/loader';
import {useModalsState} from '../../../../redux/reducers/modals';
import {useTabModalLifecycle} from '../../useTabModalManager';
import Branches from './Branches';
import CommitInfo from './CommitInfo';
import ResetShallow from './Reset_Shallow';

interface GitManagerModalContentProps {
  isOpen: boolean;
  tabID: string;
  title: string;
  dir: string;
}

function GitManagerModalContent({isOpen, dir, title, tabID}: GitManagerModalContentProps) {
  const [repoInfo, setRepoInfo] = useState<RepositoryInfo | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useDebounceBreadcrumb('Card Git Manager Modal: ', [isOpen, title]);

  useEffect(() => {
    if (!isOpen) {
      setRepoInfo(undefined);
    }
  }, [isOpen]);

  const getRepoInfo = useCallback(async () => {
    if (!dir) return;

    setLoading(true);
    try {
      const repositoryInfo = await gitIpc.getRepoInfo(dir);
      setRepoInfo(repositoryInfo);
    } catch (e) {
      topToast.danger('Something went wrong while getting the repository info.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dir]);

  useEffect(() => {
    if (dir && isOpen) {
      getRepoInfo();
    }
  }, [isOpen, dir, getRepoInfo]);

  const {onOpenChange, show} = useTabModalLifecycle('gitManager', tabID);

  const handleOpenRemote = useCallback(() => {
    if (repoInfo?.remoteUrl) {
      window.open(repoInfo.remoteUrl);
    }
  }, [repoInfo?.remoteUrl]);

  return (
    <Modal
      size="3xl"
      isOpen={isOpen}
      backdrop="blur"
      placement="center"
      isDismissable={false}
      scrollBehavior="inside"
      onOpenChange={() => onOpenChange(false)}
      classNames={{backdrop: `top-10! ${show}`, closeButton: 'cursor-default', wrapper: `top-10! ${show}`}}
      hideCloseButton>
      <ModalContent className="overflow-hidden">
        <ModalHeader
          className={
            'shrink-0 items-center overflow-hidden bg-foreground-200' + ' flex-col shadow-md dark:bg-foreground-100'
          }>
          <span className="text-lg font-semibold">{title}</span>
          {repoInfo && (
            <Link className="cursor-pointer" onPress={handleOpenRemote}>
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

                  <ResetShallow dir={dir} title={title} refreshData={getRepoInfo} isShallow={repoInfo.isShallow} />

                  <Divider />
                  <CommitInfo repoInfo={repoInfo} />
                </>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" color="warning" onPress={() => onOpenChange(false)}>
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
          {GitManagerExt ? <GitManagerExt /> : <GitManagerModalContent {...modal} />}
        </Fragment>
      ))}
    </>
  );
};

export default GitManagerModal;
