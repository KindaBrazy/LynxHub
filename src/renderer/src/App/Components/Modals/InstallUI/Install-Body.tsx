import {ModalBody, Progress} from '@nextui-org/react';
import {InstallState} from '@renderer/App/Components/Modals/InstallUI/types';
import CloneRepo from '@renderer/App/Components/Modals/InstallUI/Utils/CloneRepo';
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
};

const InstallBody = ({state, title, progressInfo, userInputElements, setUserElementsReturn, cloneResolver}: Props) => {
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
    }
    return <Fragment />;
  };

  return <ModalBody className="scrollbar-hide">{renderBody()}</ModalBody>;
};
export default memo(InstallBody);
