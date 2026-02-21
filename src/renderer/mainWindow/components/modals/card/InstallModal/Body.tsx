import {ModalBody, Progress} from '@heroui/react';
import {DownloadProgress} from '@lynx_common/types/ipc';
import {UserInputField, UserInputResult} from '@lynx_common/types/plugins/modules';
import {formatSize} from '@lynx_common/utils';
import {Descriptions, Result} from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import {capitalize} from 'lodash';
import {Dispatch, Fragment, memo, RefObject, SetStateAction, useCallback} from 'react';

import CloneRepo from './CloneRepo';
import InstallExtensions from './Extensions';
import TerminalStep from './TerminalStep';
import {InstallState} from './types';
import UserInputs from './UserInputs';

export interface InstallBodyProps {
  /** The global modal state driving which view is currently toggled. */
  state: InstallState;
  /** Formatted title name of the repository or card being installed. */
  title: string;
  /** Tracking information from the OS downloader IPC service. */
  progressInfo?: DownloadProgress;
  /** Custom configurations defining what the user needs to select or type. */
  userInputElements: {elements: UserInputField[]; title?: string};
  /** Mutates internal hook state to record answers for fields parsed in `userInputElements`. */
  setUserElementsReturn: Dispatch<SetStateAction<UserInputResult[]>>;
  /** Ref to a callback acknowledging the repository git clone is finished. */
  cloneResolver: RefObject<((dir: string) => void) | null>;
  /** Settings detailing extensions requiring download. */
  extensionsToInstall: {urls: string[]; dir: string} | undefined;
  /** Ref block triggering the app to bypass the extension stage. */
  extensionsResolver: RefObject<(() => void) | null>;
  /** Object determining how to render the dynamic progress bar UI for custom installation tracks. */
  progressBarState: {
    isIndeterminate: boolean;
    title?: string;
    percentage?: number;
    description?: {label: string; value: string}[];
  };

  /** Value indicating if the complete Install Modal parent is visibly toggled. */
  isOpen: boolean;
  /** Identifying hash mapping to this unique installation record. */
  cardId: string;
}

/**
 * Handles toggling and rendering all major center-screen content throughout the entire installation flow.
 * Displays components conditionally by matching against the standard InstallState object.
 *
 * @param {InstallBodyProps} props - The component props.
 */
const InstallBody = memo(
  ({
    state,
    title,
    progressInfo,
    userInputElements,
    setUserElementsReturn,
    cloneResolver,
    extensionsToInstall,
    extensionsResolver,
    progressBarState,
    isOpen,
    cardId,
  }: InstallBodyProps) => {
    const doneClone = useCallback(
      (dir: string) => {
        if (cloneResolver.current) {
          cloneResolver.current(dir);
          cloneResolver.current = null;
        }
      },
      [cloneResolver],
    );

    const renderBody = () => {
      switch (state.body) {
        case 'clone':
          return <CloneRepo isOpen={isOpen} done={doneClone} url={state.cloneUrl} start={state.startClone} />;
        case 'terminal':
          return <TerminalStep id={cardId} key={state.terminalKey} />;
        case 'progress-bar':
          return (
            <div className="mb-8 mt-4 text-center">
              {progressBarState.title && <span className="text-large font-semibold">{progressBarState.title}</span>}
              <Progress
                className="mt-4"
                color="secondary"
                aria-label="Download Progress"
                value={progressBarState.percentage}
                isIndeterminate={progressBarState.isIndeterminate}
                showValueLabel
              />
              {progressBarState.description && (
                <Descriptions size="small" className="mt-8" layout="vertical">
                  {progressBarState.description.map((desc, index) => (
                    <DescriptionsItem key={index} label={desc.label}>
                      {desc.value}
                    </DescriptionsItem>
                  ))}
                </Descriptions>
              )}
            </div>
          );
        case 'progress':
          return progressInfo?.stage === 'failed' ? (
            <Result
              status="error"
              title="Download Failed"
              subTitle="Please check your internet connection and try again."
            />
          ) : (
            <div className="my-6">
              <Progress
                color="secondary"
                aria-label="Download Progress"
                value={progressInfo?.percentage}
                showValueLabel
              />
              <Descriptions size="small" layout="vertical">
                <DescriptionsItem label="File Name">
                  {progressInfo?.fileName ? capitalize(progressInfo.fileName) : 'Unknown'}
                </DescriptionsItem>
                <DescriptionsItem label="Downloaded So Far">
                  {progressInfo?.downloaded ? formatSize(progressInfo.downloaded) : 'Calculating...'}
                </DescriptionsItem>
                <DescriptionsItem label="Total File Size">
                  {progressInfo?.total ? formatSize(progressInfo.total) : 'Calculating...'}
                </DescriptionsItem>
              </Descriptions>
            </div>
          );
        case 'done':
          return (
            <Result title={state.doneAll.title} status={state.doneAll.type} subTitle={state.doneAll.description} />
          );
        case 'starter':
          return (
            <div className="my-6 space-y-6 text-center">
              <p className="text-xl font-semibold">
                {"You're"} about to install <span className="font-bold">{capitalize(title)}</span>
              </p>
              <p>Choose an option below to proceed with the installation or locate a pre-existing installation.</p>
            </div>
          );
        case 'user-input':
          return (
            <UserInputs
              inputElements={userInputElements}
              setResult={setUserElementsReturn}
              extensionElements={state.extensionUserInput}
            />
          );
        case 'install-extensions':
          return <InstallExtensions extensionsURLs={extensionsToInstall} extensionsResolver={extensionsResolver} />;
        case 'extension-custom':
          return state.extensionCustomContent ? <state.extensionCustomContent /> : null;
      }
      return <Fragment />;
    };

    return <ModalBody className="scrollbar-hide">{renderBody()}</ModalBody>;
  },
);

export default InstallBody;
