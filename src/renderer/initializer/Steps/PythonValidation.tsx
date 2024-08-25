import {Button, ButtonGroup} from '@nextui-org/react';
import {Spin, StepProps, Typography} from 'antd';
import {ReactNode, useEffect, useState} from 'react';

import {toMs} from '../../../cross/CrossUtils';
import initializerIpc from '../InitializerIpc';

export const usePythonValidation = (myTurn: boolean, done: () => void): StepProps => {
  const checkAgain = () => {
    setStage('checking');
    initializerIpc
      .pythonAvailable()
      .then(version => {
        setStage('available');
        setSubTitle(version);
        done();
      })
      .catch(() => {
        setStage('notAvailable');
      });
  };

  const skip = () => {
    setStage('skip');
    done();
  };

  const [descriptions] = useState({
    waiting: <span>Python Status</span>,
    checking: <span>Checking python availability</span>,
    available: <span>Python successfully detected.</span>,
    skip: <span>Python check skipped.</span>,
    notAvailable: (
      <div className="flex flex-col space-y-1">
        <span>Python not detected.</span>
        <span className="text-white">
          {'Download Python here: '}
          <Typography.Link
            onClick={() => {
              window.open('https://www.python.org/downloads/release/python-31011/');
            }}
            className="notDraggable">
            Python Official Website
          </Typography.Link>
        </span>
        <ButtonGroup size="sm" variant="flat" className="notDraggable dark" fullWidth>
          <Button onPress={checkAgain}>Retry Detection</Button>
          <Button onPress={skip} color="warning">
            Skip Python Check
          </Button>
        </ButtonGroup>
      </div>
    ),
  });
  const [description, setDescription] = useState<ReactNode>(descriptions.waiting);
  const [subTitle, setSubTitle] = useState<ReactNode>(undefined);
  const [icon, setIcon] = useState<ReactNode | undefined>(undefined);
  const [status, setStatus] = useState<'wait' | 'process' | 'finish' | 'error' | undefined>(undefined);

  const [stage, setStage] = useState<'checking' | 'available' | 'notAvailable' | 'waiting' | 'skip'>('waiting');

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
              .pythonAvailable()
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
    title: 'Python',
    description,
    icon,
  };
};
