import {ModalBody, Progress} from '@nextui-org/react';
import {InstallState} from '@renderer/App/Components/Modals/InstallUI/types';
import CloneRepo from '@renderer/App/Components/Modals/InstallUI/Utils/CloneRepo';
import InstallExtensions from '@renderer/App/Components/Modals/InstallUI/Utils/InstallExtensions';
import TerminalStep from '@renderer/App/Components/Modals/InstallUI/Utils/TerminalStep';
import UserInputs from '@renderer/App/Components/Modals/InstallUI/Utils/UserInputs';
import {UserInputField, UserInputResult} from '@renderer/App/Modules/types';
import {Descriptions, Result} from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import {capitalize} from 'lodash';
import {Dispatch, Fragment, memo, MutableRefObject, SetStateAction, useCallback} from 'react';

import {formatSize} from '../../../../../../cross/CrossUtils';
import {DownloadProgress} from '../../../../../../cross/IpcChannelAndTypes';

type Props = {
  state: InstallState;
  title: string;
  progressInfo?: DownloadProgress;
  userInputElements: UserInputField[];
  setUserElementsReturn: Dispatch<SetStateAction<UserInputResult[]>>;
  cloneResolver: MutableRefObject<((dir: string) => void) | null>;
  extensionsToInstall: {urls: string[]; dir: string} | undefined;
  extensionsResolver: MutableRefObject<(() => void) | null>;
  progressBarState: {
    isIndeterminate: boolean;
    title?: string;
    percentage?: number;
    description?: {label: string; value: string}[];
  };
};

const InstallBody = ({
  state,
  title,
  progressInfo,
  userInputElements,
  setUserElementsReturn,
  cloneResolver,
  extensionsToInstall,
  extensionsResolver,
  progressBarState,
}: Props) => {
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
        return <CloneRepo done={doneClone} url={state.cloneUrl} start={state.startClone} />;
      case 'terminal':
        return <TerminalStep />;
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
                {progressBarState.description.map(desc => (
                  <DescriptionsItem label={desc.label}>{desc.value}</DescriptionsItem>
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
        return <Result title={state.doneAll.title} status={state.doneAll.type} subTitle={state.doneAll.description} />;
      case 'starter':
        return (
          <div className="my-6 space-y-6 text-center">
            <p className="text-xl font-semibold">
              You're about to install <span className="font-bold">{capitalize(title)}</span>
            </p>
            <p>Choose an option below to proceed with the installation or locate a pre-existing installation.</p>
          </div>
        );
      case 'user-input':
        return <UserInputs elements={userInputElements} setResult={setUserElementsReturn} />;
      case 'install-extensions':
        return <InstallExtensions extensionsURLs={extensionsToInstall} extensionsResolver={extensionsResolver} />;
    }
    return <Fragment />;
  };

  return <ModalBody className="scrollbar-hide">{renderBody()}</ModalBody>;
};
export default memo(InstallBody);
