import {Link, ModalBody, Progress} from '@heroui/react';
import {Card, Descriptions} from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import {capitalize} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {SimpleGitProgressEvent} from 'simple-git';

import {extractGitUrl} from '../../../../../../../cross/CrossUtils';
import {GitProgressCallback} from '../../../../../../../cross/IpcChannelAndTypes';
import {Folder2_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons1';
import {GitHub_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons2';
import {modalActions} from '../../../../Redux/Reducer/ModalsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import {initGitProgress} from '../../../../Utils/Constants';
import OpenDialog from '../../../Reusable/OpenDialog';
import CloneOptions from './CloneOptions';

type Props = {
  url: string;
  start: boolean;
  done: (dir: string) => void;
  isOpen: boolean;
  cardId: string;
};

export type CloneOptionsResult = {
  branch: string;
  singleBranch: boolean;
  depth?: number;
};

export default function CloneRepo({url, start, done, isOpen, cardId}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [cloneOptionsResult, setCloneOptionsResult] = useState<CloneOptionsResult>({
    depth: 1,
    branch: 'master',
    singleBranch: true,
  });

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

    const {singleBranch, branch, depth} = cloneOptionsResult;
    rendererIpc.git.cloneShallow(url, directory, singleBranch, depth, branch);

    const onProgress: GitProgressCallback = (_e, id, state, result) => {
      if (id || !isOpen) return;

      switch (state) {
        case 'Progress':
          setDownloadProgress(result as SimpleGitProgressEvent);
          break;
        case 'Failed':
          dispatch(modalActions.setWarningContentId('CLONE_REPO'));
          dispatch(modalActions.openWarning());
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
  }, [dispatch, url, directory, done, cardId, cloneOptionsResult]);

  return (
    <ModalBody className="overflow-visible px-0">
      {downloading ? (
        <>
          <Progress
            color="secondary"
            aria-label="Clone Progress"
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
              <div className="flex flex-row items-center space-x-2">
                <GitHub_Icon className="size-4" />
                <span className="text-medium">Clone Url</span>
              </div>
            }
            size="small"
            variant="borderless"
            classNames={{header: ''}}
            className="text-center !shadow-small dark:bg-foreground-100">
            <Link
              href={url}
              color="foreground"
              className="transition-colors duration-150 hover:text-primary"
              isExternal
              showAnchorIcon>
              {url}
            </Link>
          </Card>
          <Card
            title={
              <div className="flex flex-row items-center space-x-2">
                <Folder2_Icon className="size-4" />
                <span className="text-medium">Save to</span>
              </div>
            }
            size="small"
            variant="borderless"
            className="text-center !shadow-small dark:bg-foreground-100">
            <OpenDialog
              directory={directory}
              setDirectory={setDirectory}
              extraFolder={extractGitUrl(url).repo}
              dialogType={{properties: ['openDirectory']}}
            />
          </Card>
          <CloneOptions url={url} setCloneOptionsResult={setCloneOptionsResult} />
        </div>
      )}
    </ModalBody>
  );
}
