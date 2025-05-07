import {Button, Card, User} from '@heroui/react';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {PatreonUserData} from '../../../../../../../../../cross/CrossTypes';
import {Patreon_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons4';
import {checkEARepos} from '../../../../../../AppEvents/AppEvents_Utils';
import {userActions, useUserState} from '../../../../../../Redux/Reducer/UserReducer';
import {AppDispatch} from '../../../../../../Redux/Store';

export default function Profile_Patreon() {
  const patreonLoggedIn = useUserState('patreonLoggedIn');
  const patreonUserData = useUserState('patreonUserData');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();

  const loginPatreon = useCallback(() => {
    if (!patreonLoggedIn) {
      setIsLoading(true);
      window.electron.ipcRenderer
        .invoke('patreon-login')
        .then((userData: PatreonUserData) => {
          dispatch(userActions.setUserState({key: 'patreonUserData', value: userData}));
          dispatch(userActions.setUserState({key: 'patreonLoggedIn', value: true}));
          checkEARepos(userData.earlyAccess);
        })
        .catch(e => {
          console.error(e);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [patreonLoggedIn]);

  const logoutPatreon = useCallback(() => {
    setIsLoading(true);
    window.electron.ipcRenderer.invoke('patreon-logout').then(() => {
      setIsLoading(false);
      dispatch(userActions.resetUserState('patreonUserData'));
      dispatch(userActions.resetUserState('patreonLoggedIn'));
      checkEARepos(false);
    });
  }, []);

  const cancelLoading = () => {
    setIsLoading(false);
    window.electron.ipcRenderer.send('patreon-cancel-process');
  };

  return (
    <Card
      shadow="sm"
      radius="lg"
      className={`${patreonLoggedIn && '!border-success/70'} border-1 border-foreground/20 p-4`}>
      <div className="mb-3 flex flex-row items-center space-x-1.5">
        <Patreon_Icon className="text-large" />
        <span className="text-medium">Patreon</span>
      </div>
      <div className="space-between flex flex-row justify-between items-center">
        <User
          name={patreonUserData.name}
          avatarProps={{src: patreonUserData.imageUrl}}
          description={`Membership Tier: ${patreonUserData.tier}`}
        />
        <div className="flex flex-row space-x-2">
          {patreonLoggedIn ? (
            <Button size="sm" variant="light" color="warning" isLoading={isLoading} onPress={logoutPatreon}>
              Logout
            </Button>
          ) : (
            <Button size="sm" variant="flat" color="success" isLoading={isLoading} onPress={loginPatreon}>
              Login
            </Button>
          )}
          {isLoading && (
            <Button size="sm" variant="flat" color="danger" onPress={cancelLoading}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
