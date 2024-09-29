import {Link, ModalBody, Progress} from '@nextui-org/react';
import OpenDialog from '@renderer/App/Components/Reusable/OpenDialog';
import {modalActions, useModalsState} from '@renderer/App/Redux/AI/ModalsReducer';
import {AppDispatch} from '@renderer/App/Redux/Store';
import rendererIpc from '@renderer/App/RendererIpc';
import {initGitProgress} from '@renderer/App/Utils/Constants';
import {getIconByName} from '@renderer/assets/icons/SvgIconsContainer';
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
  done: (dir: string) => void;
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
          done(directory);
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
        <div className="space-y-4">
          <Card
            title={
              <div className="flex flex-row items-center justify-between space-x-2">
                {getIconByName('GitHub', {className: 'size-4'})}
                <span className="text-medium">Download From</span>
                <a />
              </div>
            }
            size="small"
            bordered={false}
            classNames={{header: ''}}
            className="text-center !shadow-small dark:bg-foreground-100">
            <Link
              href={url}
              color="foreground"
              className="transition-colors duration-300 hover:text-secondary-500"
              isExternal
              showAnchorIcon>
              {url}
            </Link>
          </Card>
          <Card
            title={
              <div className="flex flex-row items-center justify-between space-x-2">
                {getIconByName('Folder2', {className: 'size-4'})}
                <span className="text-medium">Save to</span>
                <a />
              </div>
            }
            size="small"
            bordered={false}
            className="text-center !shadow-small dark:bg-foreground-100">
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
