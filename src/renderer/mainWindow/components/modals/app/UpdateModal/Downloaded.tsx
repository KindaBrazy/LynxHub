import {Button} from '@heroui/react';
import applicationIpc from '@lynx_shared/ipc/application';
import {CheckCircle, ShieldCross} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {topToast} from '../../../../layouts/ToastProviders';
import {settingsActions} from '../../../../redux/reducers/settings';
import {AppDispatch} from '../../../../redux/store';

type Props = {errMsg?: string; success: boolean; tryAgain: () => void; cancel: () => void; onClose: () => void};

/** Install download app update */
export default function Downloaded({errMsg, success, tryAgain, cancel, onClose}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const installLater = useCallback(() => {
    dispatch(settingsActions.setSettingsState({key: 'updateAvailable', value: false}));
    topToast.info('App will be updated when closed.');
    onClose();
  }, [onClose]);

  const install = useCallback(() => {
    applicationIpc.send.updateInstall();
    onClose();
  }, [onClose]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 py-4 text-center">
      {success ? (
        <>
          <CheckCircle className="size-20 text-success" />
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Update Successfully Downloaded</h2>
            <p className="text-default-500">The update will be installed when you restart the application.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="flat" color="success" onPress={install}>
              Restart Now
            </Button>
            <Button variant="flat" color="warning" onPress={installLater}>
              Restart Later
            </Button>
          </div>
        </>
      ) : (
        <>
          <ShieldCross className="size-20 text-danger" />
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Download Unsuccessful</h2>
            <p className="text-default-500">{errMsg || 'An unknown error occurred.'}</p>
          </div>
          <div className="flex gap-4">
            <Button variant="flat" color="success" onPress={tryAgain}>
              Try Again
            </Button>
            <Button variant="flat" color="warning" onPress={cancel}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
