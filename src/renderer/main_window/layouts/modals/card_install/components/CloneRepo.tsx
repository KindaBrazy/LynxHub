import {Card, CardBody, CardHeader, Link, ModalBody, Progress} from '@heroui/react';
import {GitProgressCallback} from '@lynx_cross/types/ipc';
import {extractGitUrl, isWin} from '@lynx_cross/utils';
import filesIpc from '@lynx_shared/ipc/files';
import gitIpc from '@lynx_shared/ipc/git';
import {Descriptions} from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import {capitalize} from 'lodash';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {SimpleGitProgressEvent} from 'simple-git';

import {Folder2_Icon, GitHub_Icon} from '../../../../../shared/assets/icons';
import OpenDialog from '../../../../components/OpenDialog';
import {modalActions} from '../../../../redux/reducers/modals';
import {AppDispatch} from '../../../../redux/store';
import {initGitProgress} from '../../../../utils/constants';
import CloneOptions from './CloneOptions';

export type CloneOptionsResult = {
  branch: string;
  singleBranch: boolean;
  depth?: number;
};

type Props = {
  url: string;
  start: boolean;
  done: (dir: string) => void;
  isOpen: boolean;
};
export default function CloneRepo({url, start, done, isOpen}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [cloneOptionsResult, setCloneOptionsResult] = useState<CloneOptionsResult>({
    depth: 1,
    branch: '',
    singleBranch: true,
  });

  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<SimpleGitProgressEvent>(initGitProgress);
  const [directory, setDirectory] = useState<string>('');

  useEffect(() => {
    filesIpc.getAppDirectories('AIWorkspaces').then(dir => {
      const directory = `${dir}${isWin() ? '\\' : '/'}${extractGitUrl(url).repo}`;
      setDirectory(directory);
    });
  }, [url]);

  useEffect(() => {
    if (start) {
      setDownloading(true);

      const {singleBranch, branch, depth} = cloneOptionsResult;
      gitIpc.cloneShallow({url, directory, singleBranch, depth, branch});

      const onProgress: GitProgressCallback = (id, state, result) => {
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
      const removeListener = gitIpc.onProgress(onProgress);

      return () => removeListener();
    } else {
      return () => {};
    }
  }, [start, cloneOptionsResult, url, directory, isOpen, dispatch, done]);

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
          <Card className="dark:bg-foreground-100">
            <CardHeader className="gap-x-2">
              <GitHub_Icon />
              <span>Clone Url</span>
            </CardHeader>
            <CardBody>
              <Link
                href={url}
                color="foreground"
                className="transition-colors duration-150 hover:text-primary"
                isExternal
                showAnchorIcon>
                {url}
              </Link>
            </CardBody>
          </Card>
          <Card className="dark:bg-foreground-100">
            <CardHeader className="gap-x-2">
              <Folder2_Icon />
              <span>Save to</span>
            </CardHeader>
            <CardBody>
              <OpenDialog
                directory={directory}
                setDirectory={setDirectory}
                extraFolder={extractGitUrl(url).repo}
                dialogType={{properties: ['openDirectory']}}
              />
            </CardBody>
          </Card>
          <CloneOptions url={url} setCloneOptionsResult={setCloneOptionsResult} />
        </div>
      )}
    </ModalBody>
  );
}
