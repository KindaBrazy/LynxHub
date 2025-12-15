import {modalActions} from '../Redux/Reducer/ModalsReducer';
import {AppDispatch} from '../Redux/Store';

export function showRestartModal(dispatch: AppDispatch, message: string) {
  dispatch(modalActions.openRestartModal({message}));
}
