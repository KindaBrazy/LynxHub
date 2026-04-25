import {Description, Link, Modal, Separator, Spinner} from '@heroui-v3/react';
import {RepositoryInfo} from '@lynx_common/types';
import gitIpc from '@lynx_shared/ipc/git';
import {useDebounceBreadcrumb} from '@lynx_shared/sentry/Breadcrumbs';
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';

import {topToast} from '../../../../layouts/ToastProviders';
import {extensionsData} from '../../../../plugins/extensions/loader';
import {useModalsState} from '../../../../redux/reducers/modals';
import TabModal from '../../../TabModal';
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

  const {onOpenChange} = useTabModalLifecycle('gitManager', tabID);

  const handleOpenRemote = useCallback(() => {
    if (repoInfo?.remoteUrl) {
      window.open(repoInfo.remoteUrl);
    }
  }, [repoInfo?.remoteUrl]);

  return (
    <TabModal size="lg" isOpen={isOpen} onOpenChange={onOpenChange} dialogClassName="w-3xl! max-w-3xl!">
      <Modal.CloseTrigger />
      <Modal.Header>
        <Modal.Heading className="flex flex-col items-center">
          {title}
          {repoInfo && (
            <Link onPress={handleOpenRemote}>
              {repoInfo.remoteUrl}
              <Link.Icon />
            </Link>
          )}
        </Modal.Heading>
      </Modal.Header>

      <Modal.Body className="scrollbar-hide">
        {loading ? (
          <div className="flex flex-col justify-center items-center gap-y-2 mt-2 py-6 card card--secondary">
            <Spinner size="lg" />
            <Description className="text-sm">Gathering the repository intel, one moment!</Description>
          </div>
        ) : (
          <div className="flex flex-col gap-y-4 size-full">
            {repoInfo && (
              <>
                <Branches
                  dir={dir}
                  refreshData={getRepoInfo}
                  currentBranch={repoInfo.currentBranch}
                  availableBranches={repoInfo.availableBranches}
                />

                <ResetShallow dir={dir} title={title} refreshData={getRepoInfo} isShallow={repoInfo.isShallow} />

                <Separator />

                <CommitInfo repoInfo={repoInfo} />
              </>
            )}
          </div>
        )}
      </Modal.Body>
    </TabModal>
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
