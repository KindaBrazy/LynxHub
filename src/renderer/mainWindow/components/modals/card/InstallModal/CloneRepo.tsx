import {Card, Link, ProgressBar} from '@heroui-v3/react';
import DescriptionGrid, {DescriptionGridItem} from '@lynx/components/DescriptionGrid';
import {GitHub_Icon} from '@lynx_assets/icons';
import {GitProgressCallback} from '@lynx_common/types/ipc';
import {InitialStep} from '@lynx_common/types/plugins/modules';
import {extractGitUrl, isWin} from '@lynx_common/utils';
import filesIpc from '@lynx_shared/ipc/files';
import gitIpc from '@lynx_shared/ipc/git';
import {Folder2} from '@solar-icons/react-perf/BoldDuotone';
import {capitalize} from 'lodash';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {SimpleGitProgressEvent} from 'simple-git';

import {modalActions} from '../../../../redux/reducers/modals';
import {AppDispatch} from '../../../../redux/store';
import {initGitProgress} from '../../../../utils/constants';
import OpenDialog from '../../../OpenDialog';
import CloneOptions from './CloneOptions';
import {renderAlerts} from './CustomAlert';
import {InstallState} from './types';

export type CloneOptionsResult = {
  branch: string;
  singleBranch: boolean;
  depth?: number;
};

export interface CloneRepoProps {
  /** The standard Git repository URL to be cloned. */
  url: string;
  /** Starts the clone sequence immediately if true. Keeps the options panel visible if false. */
  start: boolean;
  /** Callback fired containing the final filesystem path once cloning succeeds. */
  done: (dir: string) => void;
  /** Used to detect if the prompt is open to skip duplicate IPC dispatches. */
  isOpen: boolean;
  /** Utility function to partially mutate the modal state. */
  updateState: (newState: Partial<InstallState> | ((prev: InstallState) => Partial<InstallState>)) => void;

  currentStep: InitialStep;
}

/**
 * Orchestrates Git cloning interactions, utilizing the OS filesystem picker for path selection
 * and rendering a simple-git progress visualization.
 *
 * @param {CloneRepoProps} props - The component props.
 */
export default function CloneRepo({url, start, done, isOpen, updateState, currentStep}: CloneRepoProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [cloneOptionsResult, setCloneOptionsResult] = useState<CloneOptionsResult>({
    depth: 1,
    branch: '',
    singleBranch: true,
  });

  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<SimpleGitProgressEvent>(initGitProgress);
  const [directory, setDirectory] = useState<string>('');
  const progressItems: DescriptionGridItem[] = [
    {key: 'stage', label: 'Stage', content: capitalize(downloadProgress.stage)},
    {key: 'item', label: 'Item', content: downloadProgress.processed},
    {key: 'total', label: 'Total', content: downloadProgress.total},
  ];

  useEffect(() => {
    filesIpc.getAppDirectories('AIWorkspaces').then(dir => {
      const directory = `${dir}${isWin ? '\\' : '/'}${extractGitUrl(url).repo}`;
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
            updateState({startClone: false});
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
    <>
      {downloading ? (
        <>
          <ProgressBar
            size="lg"
            value={downloadProgress.progress}
            isIndeterminate={downloadProgress.stage === 'unknown'}>
            <ProgressBar.Output />
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>

          <DescriptionGrid
            columns={2}
            items={progressItems}
            itemClassName="bg-surface"
            className="mt-6 bg-surface-secondary"
          />
        </>
      ) : (
        <div className="flex flex-col gap-y-4">
          <Card variant="secondary">
            <Card.Header className="gap-x-2 flex flex-row items-center text-surface-secondary-foreground">
              <GitHub_Icon />
              <span>Clone Url</span>
            </Card.Header>
            <Card.Content>
              <Link onPress={() => window.open(url)}>
                {url}
                <Link.Icon />
              </Link>
            </Card.Content>
          </Card>
          <Card variant="secondary">
            <Card.Header className="gap-x-2 flex flex-row items-center text-surface-secondary-foreground">
              <Folder2 />
              <span>Save to</span>
            </Card.Header>
            <Card.Content>
              <OpenDialog
                directory={directory}
                setDirectory={setDirectory}
                extraFolder={extractGitUrl(url).repo}
                dialogType={{properties: ['openDirectory']}}
              />
            </Card.Content>
          </Card>
          <CloneOptions url={url} setCloneOptionsResult={setCloneOptionsResult} />
          {renderAlerts(currentStep)}
        </div>
      )}
    </>
  );
}
