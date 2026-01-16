import {Button, CircularProgress, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {Divider} from 'antd';
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {RepositoryInfo} from '../../../../../cross/CrossTypes';
import {useDebounceBreadcrumb} from '../../../../shared/sentry/Breadcrumbs';
import {lynxTopToast} from '../../../hooks/utils';
import {extensionsData} from '../../../plugins/extensions/loader';
import {useModalsState} from '../../../redux/reducers/modals';
import {AppDispatch} from '../../../redux/store';
import rendererIpc from '../../../services/RendererIpc';
import {useTabModalLifecycle} from '../useTabModalManager';
import Branches from './Branches';
import CommitInfo from './CommitInfo';
import Reset_Shallow from './Reset_Shallow';

type Props = {isOpen: boolean; tabID: string; title: string; dir: string};

function CardGitManager_Modal({isOpen, dir, title, tabID}: Props) {
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

  const {onOpenChange, show} = useTabModalLifecycle('gitManager', tabID);

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
          {GitManagerExt ? <GitManagerExt /> : <CardGitManager_Modal {...modal} />}
        </Fragment>
      ))}
    </>
  );
};

export default GitManagerModal;
