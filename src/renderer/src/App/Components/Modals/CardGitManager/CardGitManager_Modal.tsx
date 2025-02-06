import {Button, CircularProgress, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {Divider} from 'antd';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {RepositoryInfo} from '../../../../../../cross/CrossTypes';
import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import Branches from './Branches';
import CommitInfo from './CommitInfo';
import Reset_Shallow from './Reset_Shallow';

export default function CardGitManager_Modal() {
  const {isOpen, dir, title} = useModalsState('gitManager');

  const dispatch = useDispatch<AppDispatch>();

  const [repoInfo, setRepoInfo] = useState<RepositoryInfo | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

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
      .finally(() => setLoading(false));
  }, [dir]);

  useEffect(() => {
    if (dir) getRepoInfo();
  }, [isOpen, dir]);

  const onOpenChange = useCallback(() => dispatch(modalActions.closeGitManager()), [dispatch]);

  return (
    <Modal
      size="3xl"
      isOpen={isOpen}
      backdrop="blur"
      isDismissable={false}
      scrollBehavior="inside"
      onOpenChange={onOpenChange}
      classNames={{backdrop: '!top-10', closeButton: 'cursor-default', wrapper: '!top-10'}}
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

                  <Reset_Shallow dir={dir} refreshData={getRepoInfo} isShallow={repoInfo.isShallow} />

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
