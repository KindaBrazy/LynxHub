import {Avatar, Button, Card, Description, Label, Spinner} from '@heroui/react';
import {userActions, useUserState} from '@lynx/redux/reducers/user';
import {AppDispatch} from '@lynx/redux/store';
import {LYNXHUB_WEBSITE} from '@lynx_common/consts';
import {getCacheUrl, getFallbackString} from '@lynx_common/utils';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import userIpc from '@lynx_shared/ipc/user';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {User} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

const Profile_Account = memo(() => {
  const isLoggedIn = useUserState('isLoggedIn');
  const userData = useUserState('userData');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();

  const loginAccount = useCallback(() => {
    AddBreadcrumb_Renderer(`Website Login`);
    if (!isLoggedIn) {
      setIsLoading(true);
      userIpc.account
        .login()
        .then(data => {
          dispatch(userActions.setUserState({key: 'userData', value: data}));
          dispatch(userActions.setUserState({key: 'isLoggedIn', value: true}));
        })
        .catch(e => {
          console.error(e);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isLoggedIn, dispatch]);

  const logoutAccount = useCallback(() => {
    AddBreadcrumb_Renderer(`Website Logout`);
    setIsLoading(true);
    userIpc.account
      .logout()
      .then(() => {
        dispatch(userActions.resetUserState('userData'));
        dispatch(userActions.resetUserState('isLoggedIn'));
        pluginsIpc.checkForSync('public');
      })
      .catch(console.warn)
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  const cancelLoading = useCallback(() => {
    AddBreadcrumb_Renderer(`Website Cancel Loading`);
    setIsLoading(false);
    window.electron.ipcRenderer.send('patreon-cancel-process');
  }, []);

  return (
    <Card className={`border ${isLoggedIn ? 'border-success/70 bg-success/5' : 'border-surface-secondary'} `}>
      <Card.Header>
        <div className="flex flex-row items-center space-x-1.5">
          <User />
          <span className="text-medium">Account</span>
        </div>
      </Card.Header>

      <Card.Content className="space-between flex flex-row justify-between items-center">
        <div className="inline-flex items-center gap-2">
          <Avatar className={`shrink-0`}>
            <Avatar.Image src={getCacheUrl(userData.imageUrl)} />
            <Avatar.Fallback>{getFallbackString(userData.name)}</Avatar.Fallback>
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
              {userData.name}
            </Label>
            <Description>{userData.tier}</Description>
          </div>
        </div>

        <div className="flex flex-row space-x-2">
          {isLoggedIn ? (
            <>
              <Button size="sm" variant="secondary" onPress={() => window.open(`${LYNXHUB_WEBSITE}/account`)}>
                Manage Account
              </Button>
              <Button size="sm" variant="danger-soft" isPending={isLoading} onPress={logoutAccount}>
                {isLoading ? <Spinner size="sm" color="current" /> : 'Logout'}
              </Button>
            </>
          ) : (
            <Button size="sm" variant="primary" isPending={isLoading} onPress={loginAccount}>
              {isLoading ? <Spinner size="sm" color="current" /> : 'Login'}
            </Button>
          )}
          {isLoading && !isLoggedIn && (
            <Button size="sm" variant="danger-soft" onPress={cancelLoading}>
              Cancel
            </Button>
          )}
        </div>
      </Card.Content>
    </Card>
  );
});

Profile_Account.displayName = 'Profile_Account';

export default Profile_Account;
