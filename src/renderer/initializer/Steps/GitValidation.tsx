import {Button} from '@nextui-org/react';
import {Spin, StepProps, Typography} from 'antd';
import {ReactNode, useEffect, useState} from 'react';

import {toMs} from '../../../cross/CrossUtils';
import initializerIpc from '../InitializerIpc';

export const useGitValidation = (myTurn: boolean, done: () => void): StepProps => {
  const checkAgain = () => {
    setStage('checking');
    initializerIpc
      .gitAvailable()
      .then(version => {
        setStage('available');
        setSubTitle(version);
        done();
      })
      .catch(() => {
        setStage('notAvailable');
      });
  };
  const [descriptions] = useState({
    waiting: <span>Git Status</span>,
    checking: <span>Checking Git availability</span>,
    available: <span>Git successfully detected.</span>,
    notAvailable: (
      <div className="flex flex-col space-y-1">
        <span>Git not detected.</span>
        <span className="text-white">
          {'Download Git here: '}
          <Typography.Link
            onClick={() => {
              window.open('https://www.git-scm.com/downloads');
            }}
            className="notDraggable">
            Git Official Website
          </Typography.Link>
        </span>
        <Button size="sm" variant="flat" onPress={checkAgain} className="notDraggable dark">
          Retry Detection
        </Button>
      </div>
    ),
  });
  const [description, setDescription] = useState<ReactNode>(descriptions.waiting);
  const [subTitle, setSubTitle] = useState<ReactNode>(undefined);
  const [icon, setIcon] = useState<ReactNode | undefined>(undefined);
  const [status, setStatus] = useState<'wait' | 'process' | 'finish' | 'error' | undefined>(undefined);

  const [stage, setStage] = useState<'checking' | 'available' | 'notAvailable' | 'waiting'>('waiting');

  useEffect(() => {
    setDescription(descriptions[stage]);
    if (stage === 'checking') {
      setIcon(<Spin />);
      setStatus('process');
    } else {
      if (stage === 'waiting') setStatus('wait');
      if (stage === 'notAvailable') setStatus('error');
      if (stage === 'available') setStatus('finish');
      setIcon(undefined);
    }
  }, [stage]);

  useEffect(() => {
    if (myTurn) {
      if (stage !== 'available') {
        setStage('checking');
        setTimeout(
          () => {
            initializerIpc
              .gitAvailable()
              .then(version => {
                setStage('available');
                setSubTitle(version);
                done();
              })
              .catch(() => {
                setStage('notAvailable');
              });
          },
          toMs(1, 'seconds'),
        );
      }
    }
  }, [myTurn]);

  return {
    subTitle,
    status,
    title: 'Git',
    description,
    icon,
  };
};
