import {Button} from '@heroui/react';
import applicationIpc from '@lynx_shared/ipc/application';
import {Result} from 'antd';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions} from '../../../../redux/reducers/settings';
import {AppDispatch} from '../../../../redux/store';
import {lynxTopToast} from '../../../../utils/hooks';

type Props = {errMsg?: string; success: boolean; tryAgain: () => void; cancel: () => void; onClose: () => void};

/** Install download app update */
export default function Downloaded({errMsg, success, tryAgain, cancel, onClose}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const installLater = useCallback(() => {
    dispatch(settingsActions.setSettingsState({key: 'updateAvailable', value: false}));
    lynxTopToast(dispatch).info('App will be updated when closed.');
    onClose();
  }, [onClose, dispatch]);

  const install = useCallback(() => {
    applicationIpc.send.updateInstall();
    onClose();
  }, [onClose]);

  return (
    <>
      {success ? (
        <Result
          extra={[
            <Button variant="flat" color="success" key="restart-now" onPress={install}>
              Restart Now
            </Button>,
            <Button variant="flat" color="warning" key="restart-later" onPress={installLater}>
              Restart Later
            </Button>,
          ]}
          status="success"
          title="Update Successfully Downloaded"
          subTitle="The update will be installed when you restart the application."
        />
      ) : (
        <Result
          extra={[
            <Button variant="flat" key="try-again" color="success" onPress={tryAgain}>
              Try Again
            </Button>,
            <Button key="cancel" variant="flat" color="warning" onPress={cancel}>
              Cancel
            </Button>,
          ]}
          status="error"
          subTitle={errMsg}
          title="Download Unsuccessful"
        />
      )}
    </>
  );
}
