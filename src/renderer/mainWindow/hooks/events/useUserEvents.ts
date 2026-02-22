import {useAppState} from '@lynx/redux/reducers/app';
import {userActions} from '@lynx/redux/reducers/user';
import {AppDispatch} from '@lynx/redux/store';
import userIpc from '@lynx_shared/ipc/user';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';

/**
 * Manages Patreon account integration and user state.
 */
export const usePatreon = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isOnline = useAppState('isOnline');

  useEffect(() => {
    userIpc.patreon.getInfo().then(userData => {
      if (userData) {
        dispatch(userActions.setUserState({key: 'patreonUserData', value: userData}));
        dispatch(userActions.setUserState({key: 'patreonLoggedIn', value: true}));
      }
    });

    const offReleaseChannel = userIpc.patreon.onReleaseChannel(stage => dispatch(userActions.setUpdateChannel(stage)));

    return () => offReleaseChannel();
  }, [dispatch, isOnline]);
};
