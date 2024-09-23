import {Button} from '@nextui-org/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {modalActions} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';

type Props = {
  id: string;
  url: string;
  done: (dir: string) => void;
};
/** Render a button that allows the user to locate an existing installation of the Card,
 * handles saving the installation data, and displays an error modal if the installation is not found. */
export default function LocateRepo({id, url, done}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  // Locate an existing installation of the WebUI.
  const locateExisting = useCallback(() => {
    console.log(id, url);
    rendererIpc.git
      .locateCard(url)
      .then(path => {
        console.log('path:', path);
        // If valid repo dir is selected, then save data
        if (path) {
          done(path);
        } else {
          // Otherwise show error modal
          dispatch(modalActions.setWarningContentId('LOCATE_REPO'));
          dispatch(modalActions.openModal('warningModal'));
        }
      })
      .catch(err => {
        dispatch(modalActions.setWarningContentId('LOCATE_REPO'));
        dispatch(modalActions.openModal('warningModal'));
        console.log(err);
      });
  }, [url, id, done, dispatch]);

  return (
    <Button color="default" variant="light" onPress={locateExisting} className="cursor-default">
      Locate
    </Button>
  );
}
