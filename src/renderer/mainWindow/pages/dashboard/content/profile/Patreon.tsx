import {Alert, Avatar, Button, Card, Description, Label, Spinner} from '@heroui/react';
import {userActions, useUserState} from '@lynx/redux/reducers/user';
import {AppDispatch} from '@lynx/redux/store';
import {Patreon_Icon} from '@lynx_assets/icons';
import {getCacheUrl, getFallbackString} from '@lynx_common/utils';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import userIpc from '@lynx_shared/ipc/user';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {memo, useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

const Profile_Patreon = memo(() => {
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

  const cancelLoading = useCallback(() => {
    AddBreadcrumb_Renderer(`Patreon Cancel Loading`);
    setIsLoading(false);
    window.electron.ipcRenderer.send('patreon-cancel-process');
  }, []);

  const openPatreonPage = useCallback(() => {
    window.open('https://www.patreon.com/lynxhub');
  }, []);

  const closeAlert = useCallback(() => {
    setIsNotMember(false);
  }, []);

  return (
    <Card className={`border ${patreonLoggedIn ? 'border-success/70 bg-success/5' : 'border-surface-secondary'} `}>
      <Card.Header>
        <div className="flex flex-row items-center space-x-1.5">
          <Patreon_Icon className="text-large" />
          <span className="text-medium">Patreon</span>
        </div>
      </Card.Header>

      <Card.Content className="space-between flex flex-row justify-between items-center">
        <div className="inline-flex items-center gap-2">
          <Avatar className={`shrink-0`}>
            <Avatar.Image src={getCacheUrl(patreonUserData.imageUrl)} />
            <Avatar.Fallback>{getFallbackString(patreonUserData.name)}</Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col">
            <Label
              className={
                'cursor-text outline-none focus:border border-transparent focus:border-surface-secondary' +
                ' focus:px-1.5 focus:py-0.5 rounded-lg transition duration-200 line-clamp-1 z-20'
              }
              spellCheck="false"
              onClick={e => e.stopPropagation()}
              contentEditable
              suppressContentEditableWarning>
              {patreonUserData.name}
            </Label>
            <Description>{patreonUserData.tier}</Description>
          </div>
        </div>
        {isNotMember ? (
          <div className="items-end">
            <Alert status="warning" className="bg-surface-secondary">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Join LynxHub Patreon</Alert.Title>
                <Alert.Description>You are not a member of the Lynxhub</Alert.Description>
                <Button size="sm" className="mt-2" onPress={openPatreonPage}>
                  Become a Member
                </Button>
              </Alert.Content>
              <Button size="sm" onPress={closeAlert} variant="danger-soft">
                Close
              </Button>
            </Alert>
          </div>
        ) : (
          <div className="flex flex-row space-x-2">
            {patreonLoggedIn ? (
              <Button size="sm" variant="danger-soft" isPending={isLoading} onPress={logoutPatreon}>
                {isLoading ? <Spinner size="sm" color="current" /> : 'Logout'}
              </Button>
            ) : (
              <Button size="sm" variant="primary" isPending={isLoading} onPress={loginPatreon}>
                {isLoading ? <Spinner size="sm" color="current" /> : 'Login'}
              </Button>
            )}
            {isLoading && !patreonLoggedIn && (
              <Button size="sm" variant="danger-soft" onPress={cancelLoading}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </Card.Content>
    </Card>
  );
});

Profile_Patreon.displayName = 'Profile_Patreon';

export default Profile_Patreon;
