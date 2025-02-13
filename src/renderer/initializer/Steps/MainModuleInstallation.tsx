import {Button} from '@heroui/react';
import {Spin, StepProps} from 'antd';
import {Dispatch, ReactNode, SetStateAction, useEffect, useState} from 'react';
import {SimpleGitProgressEvent} from 'simple-git';

import initializerIpc from '../InitializerIpc';

export const useMainModuleInstallation = (
  myTurn: boolean,
  done: () => void,
  setPercent: Dispatch<SetStateAction<number | undefined>>,
): StepProps => {
  const tryAgain = () => {
    setStage('installing');
    initializerIpc.installAIModule();
  };
  const [descriptions] = useState({
    waiting: <span>AI Module</span>,
    installing: <span>Installing module. Please wait...</span>,
    success: <span>Module installed successfully</span>,
    failed: (
      <div className="flex flex-col space-y-1">
        <span>Installation failed.</span>
        <Button size="sm" variant="flat" onPress={tryAgain} className="notDraggable dark">
          Retry
        </Button>
      </div>
    ),
  });
  const [description, setDescription] = useState<ReactNode>(descriptions.waiting);
  const [subTitle, setSubTitle] = useState<ReactNode>(undefined);
  const [icon, setIcon] = useState<ReactNode | undefined>(undefined);
  const [status, setStatus] = useState<'wait' | 'process' | 'finish' | 'error' | undefined>(undefined);

  const [stage, setStage] = useState<'installing' | 'success' | 'failed' | 'waiting'>('waiting');

  useEffect(() => {
    setDescription(descriptions[stage]);
    if (stage === 'installing') {
      setIcon(<Spin />);
      setStatus('process');
    } else {
      if (stage === 'waiting') setStatus('wait');
      if (stage === 'failed') setStatus('error');
      if (stage === 'success') setStatus('finish');
      setIcon(undefined);
    }
  }, [stage]);

  useEffect(() => {
    initializerIpc.onInstallAIModule((_e, _id, state, result) => {
      switch (state) {
        case 'Progress': {
          const {progress} = result as SimpleGitProgressEvent;
          setSubTitle(`${progress}%`);
          setPercent(progress);
          break;
        }
        case 'Failed':
          setStage('failed');
          setPercent(undefined);
          break;
        case 'Completed':
          done();
          setStage('success');
          setPercent(100);
          break;
      }
    });
    if (myTurn) {
      if (stage !== 'success') {
        setStage('installing');
        setPercent(1);
        initializerIpc.installAIModule();
      }
    }
  }, [myTurn]);

  return {
    status,
    subTitle,
    title: 'WebUI Container',
    description,
    icon,
  };
};
