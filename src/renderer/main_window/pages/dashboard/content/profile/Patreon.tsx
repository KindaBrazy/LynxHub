import {Alert, Button, Card, User} from '@heroui/react';
import {userActions, useUserState} from '@lynx/redux/reducers/user';
import {AppDispatch} from '@lynx/redux/store';
import {Patreon_Icon} from '@lynx_assets/icons';
import {getCacheUrl} from '@lynx_common/utils';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import userIpc from '@lynx_shared/ipc/user';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

export default function Profile_Patreon() {
  const patreonLoggedIn = useUserState('patreonLoggedIn');
  const patreonUserData = useUserState('patreonUserData');
  const [isNotMember, setIsNotMember] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();

  const loginPatreon = useCallback(() => {
    AddBreadcrumb_Renderer(`Patreon Login`);
    if (!patreonLoggedIn) {
      setIsNotMember(false);
      setIsLoading(true);
      userIpc.patreon
        .login()
        .then(userData => {
          dispatch(userActions.setUserState({key: 'patreonUserData', value: userData}));
          dispatch(userActions.setUserState({key: 'patreonLoggedIn', value: true}));
        })
        .catch(e => {
          console.error(e);
          if (e.message && e.message.includes('not member')) setIsNotMember(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [patreonLoggedIn, dispatch]);

  const logoutPatreon = useCallback(() => {
    AddBreadcrumb_Renderer(`Patreon Logout`);
    setIsLoading(true);
    userIpc.patreon
      .logout()
      .then(() => {
        dispatch(userActions.resetUserState('patreonUserData'));
        dispatch(userActions.resetUserState('patreonLoggedIn'));
        pluginsIpc.checkForSync('public');
      })
      .catch(console.warn)
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  const cancelLoading = () => {
    AddBreadcrumb_Renderer(`Patreon Cancel Loading`);
    setIsLoading(false);
    window.electron.ipcRenderer.send('patreon-cancel-process');
  };

  const openPatreonPage = () => {
    window.open('https://www.patreon.com/lynxhub');
  };

  return (
    <Card
      shadow="sm"
      radius="lg"
      className={`${patreonLoggedIn && 'border-success/70! bg-success/5'} border border-foreground/20 p-4`}>
      <div className="mb-3 flex flex-row items-center space-x-1.5">
        <Patreon_Icon className="text-large" />
        <span className="text-medium">Patreon</span>
      </div>
      <div className="space-between flex flex-row justify-between items-center">
        <User
          avatarProps={{
            src: getCacheUrl(patreonUserData.imageUrl),
          }}
          name={patreonUserData.name}
          description={patreonUserData.tier}
        />
        {isNotMember ? (
          <div className="flex flex-col items-end space-y-2 text-right">
            <Alert
              description={
                <div className="flex flex-row items-center justify-between w-full">
                  <Button size="sm" variant="flat" color="primary" onPress={openPatreonPage}>
                    Become a Member
                  </Button>
                  <Button size="sm" variant="light" onPress={() => setIsNotMember(false)}>
                    Close
                  </Button>
                </div>
              }
              color="default"
              title="You are not a member of the Lynxhub Patreon."
              classNames={{description: 'py-1 w-full', title: 'text-warning'}}
            />
            {/*<div className="flex flex-row space-x-2">
              <Button size="sm" variant="flat" color="primary" onPress={openPatreonPage}>
                Become a Member
              </Button>
              <Button size="sm" variant="light" onPress={() => setIsNotMember(false)}>
                Close
              </Button>
            </div>
            <p className="text-xs text-danger">You are not a member of the Lynxhub Patreon.</p>*/}
          </div>
        ) : (
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
            {isLoading && !patreonLoggedIn && (
              <Button size="sm" variant="flat" color="danger" onPress={cancelLoading}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
