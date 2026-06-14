import {Description, Link, Modal, Separator, Spinner} from '@heroui/react';
import {RepositoryInfo} from '@lynx_common/types';
import gitIpc from '@lynx_shared/ipc/git';
import {useDebounceBreadcrumb} from '@lynx_shared/sentry/Breadcrumbs';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {topToast} from '../../../../../layouts/ToastProviders';
import {extensionsData} from '../../../../../plugins/extensions/loader';
import {useInstalledCard} from '../../../../../utils/hooks';
import TabModal from '../../../../TabModal';
import {useCardStore} from '../../../store';
import {CommonProps} from '../../about/types';
import Branches from './Branches';
import CommitInfo from './CommitInfo';
import ResetShallow from './Reset_Shallow';

function GitManagerModalContent({state}: CommonProps) {
  const id = useCardStore(st => st.id);
  const cardTitle = useCardStore(st => st.title);

  const card = useInstalledCard(id);
  const dir = card ? card.dir : undefined;
  const title = `${cardTitle} Repository Settings`;

  const [repoInfo, setRepoInfo] = useState<RepositoryInfo | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useDebounceBreadcrumb('Card Git Manager Modal: ', [state.isOpen, title]);

  useEffect(() => {
    if (!state.isOpen) {
      setRepoInfo(undefined);
    }
  }, [state.isOpen]);

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
    if (dir && state.isOpen) {
      // getRepoInfo();
    }
  }, [state.isOpen, dir, getRepoInfo]);

  const handleOpenRemote = useCallback(() => {
    if (repoInfo?.remoteUrl) {
      window.open(repoInfo.remoteUrl);
    }
  }, [repoInfo?.remoteUrl]);

  if (!dir) return;

  return (
    <TabModal size="lg" isOpen={state.isOpen} onOpenChange={state.setOpen} dialogClassName="w-3xl! max-w-3xl!">
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

                <CommitInfo dir={dir} repoInfo={repoInfo} />
              </>
            )}
          </div>
        )}
      </Modal.Body>
    </TabModal>
  );
}

const GitManagerModal = ({state}: CommonProps) => {
  const GitManagerExt = useMemo(() => extensionsData.replaceModals.gitManager, []);

  if (!state.isOpen) return null;

  return GitManagerExt ? <GitManagerExt /> : <GitManagerModalContent state={state} />;
};

export default GitManagerModal;
