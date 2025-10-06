import {Button, Card, User} from '@heroui/react';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import AddBreadcrumb_Renderer from '../../../../../../../../Breadcrumbs';
import {Patreon_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import {userActions, useUserState} from '../../../../../../Redux/Reducer/UserReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';

export default function Profile_Patreon() {
  const patreonLoggedIn = useUserState('patreonLoggedIn');
  const patreonUserData = useUserState('patreonUserData');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();

  const loginPatreon = useCallback(() => {
    AddBreadcrumb_Renderer(`Patreon Login`);
    if (!patreonLoggedIn) {
      setIsLoading(true);
      rendererIpc.patreon
        .login()
        .then(userData => {
          dispatch(userActions.setUserState({key: 'patreonUserData', value: userData}));
          dispatch(userActions.setUserState({key: 'patreonLoggedIn', value: true}));
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
    AddBreadcrumb_Renderer(`Patreon Logout`);
    setIsLoading(true);
    rendererIpc.patreon
      .logout()
      .then(() => {
        dispatch(userActions.resetUserState('patreonUserData'));
        dispatch(userActions.resetUserState('patreonLoggedIn'));
        rendererIpc.plugins.checkForSync('public');
      })
      .catch(console.warn)
      .finally(() => setIsLoading(false));
  }, []);

  const cancelLoading = () => {
    AddBreadcrumb_Renderer(`Patreon Cancel Loading`);
    setIsLoading(false);
    window.electron.ipcRenderer.send('patreon-cancel-process');
  };

  return (
    <Card
      shadow="sm"
      radius="lg"
      className={`${patreonLoggedIn && '!border-success/70 bg-success/5'} border border-foreground/20 p-4`}>
      <div className="mb-3 flex flex-row items-center space-x-1.5">
        <Patreon_Icon className="text-large" />
        <span className="text-medium">Patreon</span>
      </div>
      <div className="space-between flex flex-row justify-between items-center">
        <User
          name={patreonUserData.name}
          description={patreonUserData.tier}
          avatarProps={{src: patreonUserData.imageUrl}}
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
