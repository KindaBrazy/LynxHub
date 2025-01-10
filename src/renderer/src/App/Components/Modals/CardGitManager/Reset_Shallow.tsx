import {Button, ButtonGroup} from '@nextui-org/react';
import {message} from 'antd';
import {useState} from 'react';

import rendererIpc from '../../../RendererIpc';

type Props = {isShallow: boolean; dir: string; refreshData: () => void};
export default function Reset_Shallow({isShallow, dir, refreshData}: Props) {
  const [isLoadingShallow, setIsLoadingShallow] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const unShallow = () => {
    setIsLoadingShallow(true);
    rendererIpc.git
      .unShallow(dir)
      .then(() => {
        message.success('UnShallow successfully');
        refreshData();
      })
      .catch(() => message.error(`failed UnShallow`))
      .finally(() => setIsLoadingShallow(false));
  };

  const resetHard = () => {
    setIsResetting(true);
    rendererIpc.git
      .resetHard(dir)
      .then(() => {
        message.success('Reset hard success');
        refreshData();
      })
      .catch(() => message.error(`failed to reset hard`))
      .finally(() => setIsResetting(false));
  };

  return (
    <ButtonGroup fullWidth>
      <Button variant="flat" color="danger" onPress={resetHard} isLoading={isResetting} fullWidth>
        Reset Hard
      </Button>
      {isShallow && (
        <Button variant="flat" color="secondary" onPress={unShallow} isLoading={isLoadingShallow} fullWidth>
          UnShallow
        </Button>
      )}
    </ButtonGroup>
  );
}
