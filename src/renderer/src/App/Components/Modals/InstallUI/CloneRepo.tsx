import {Link, ModalBody, Progress} from '@nextui-org/react';
import OpenDialog from '@renderer/App/Components/Reusable/OpenDialog';
import {InstallCloneResult} from '@renderer/App/Modules/types';
import {modalActions, useModalsState} from '@renderer/App/Redux/AI/ModalsReducer';
import {AppDispatch} from '@renderer/App/Redux/Store';
import rendererIpc from '@renderer/App/RendererIpc';
import {initGitProgress} from '@renderer/App/Utils/Constants';
import {Card, Descriptions} from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import {capitalize} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {SimpleGitProgressEvent} from 'simple-git';

import {extractGitUrl} from '../../../../../../cross/CrossUtils';
import {GitProgressCallback} from '../../../../../../cross/IpcChannelAndTypes';

type Props = {
  url: string;
  start: boolean;
  done: (result: InstallCloneResult) => void;
};

export default function CloneRepo({url, start, done}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const {cardId} = useModalsState('installUIModal');

  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<SimpleGitProgressEvent>(initGitProgress);
  const [directory, setDirectory] = useState<string>('');

  useEffect(() => {
    rendererIpc.file.getAppDirectories('AIWorkspaces').then(dir => {
      const isWin = window.osPlatform === 'win32';
      const directory = `${dir}${isWin ? '\\' : '/'}${extractGitUrl(url).repo}`;
      setDirectory(directory);
    });
  }, [url]);

  useEffect(() => {
    if (start) install();
  }, [start]);

  const install = useCallback(() => {
    setDownloading(true);

    // Start cloning
    rendererIpc.git.cloneRepo(url, directory);
    const onProgress: GitProgressCallback = (_e, id, state, result) => {
      if (id) return;

      switch (state) {
        case 'Progress':
          setDownloadProgress(result as SimpleGitProgressEvent);
          break;
        case 'Failed':
          dispatch(modalActions.setWarningContentId('CLONE_REPO'));
          dispatch(modalActions.openModal('warningModal'));
          setDownloading(false);
          break;
        case 'Completed':
          setDownloading(false);
          done({dir: directory, locatedPreInstall: false});
          break;
      }
    };

    // Update ui with progress
    rendererIpc.git.offProgress();
    rendererIpc.git.onProgress(onProgress);

    return () => {
      rendererIpc.git.offProgress();
    };
  }, [url, directory, done, cardId, dispatch]);

  return (
    <ModalBody className="overflow-visible px-0">
      {downloading ? (
        <>
          <Progress
            color="secondary"
            value={downloadProgress.progress}
            isIndeterminate={downloadProgress.stage === 'unknown'}
            showValueLabel
          />
          <Descriptions size="small" layout="vertical">
            <DescriptionsItem label="Stage">{capitalize(downloadProgress.stage)}</DescriptionsItem>
            <DescriptionsItem label="Item">{downloadProgress.processed}</DescriptionsItem>
            <DescriptionsItem label="Total">{downloadProgress.total}</DescriptionsItem>
          </Descriptions>
        </>
      ) : (
        <div className="space-y-2">
          <Card bordered={false} title="Download From">
            <Link
              href={url}
              color="foreground"
              className="transition-colors duration-300 hover:text-secondary-500"
              isExternal
              showAnchorIcon>
              {url}
            </Link>
          </Card>
          <Card title="Save to" bordered={false}>
            <OpenDialog
              directory={directory}
              dialogType="openDirectory"
              setDirectory={setDirectory}
              extraFolder={extractGitUrl(url).repo}
            />
          </Card>
        </div>
      )}
    </ModalBody>
  );
}
