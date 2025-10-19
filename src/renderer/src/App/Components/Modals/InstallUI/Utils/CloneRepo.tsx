import {Card, CardBody, CardHeader, Link, ModalBody, Progress} from '@heroui/react';
import {Descriptions} from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import {capitalize} from 'lodash';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {SimpleGitProgressEvent} from 'simple-git';

import {extractGitUrl} from '../../../../../../../cross/CrossUtils';
import {GitProgressCallback} from '../../../../../../../cross/IpcChannelAndTypes';
import {Folder2_Icon, GitHub_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {modalActions} from '../../../../Redux/Reducer/ModalsReducer';
import {AppDispatch} from '../../../../Redux/Store';
import rendererIpc from '../../../../RendererIpc';
import {initGitProgress} from '../../../../Utils/Constants';
import OpenDialog from '../../../Reusable/OpenDialog';
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
    rendererIpc.file.getAppDirectories('AIWorkspaces').then(dir => {
      const isWin = window.osPlatform === 'win32';
      const directory = `${dir}${isWin ? '\\' : '/'}${extractGitUrl(url).repo}`;
      setDirectory(directory);
    });
  }, [url]);

  useEffect(() => {
    if (start) {
      setDownloading(true);

      const {singleBranch, branch, depth} = cloneOptionsResult;
      rendererIpc.git.cloneShallow({url, directory, singleBranch, depth, branch});

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
      const removeListener = rendererIpc.git.onProgress(onProgress);

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
          <Card className="bg-foreground-100">
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
          <Card className="bg-foreground-100">
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
