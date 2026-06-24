import {Avatar, Button, Card, Description, Label, Spinner} from '@heroui/react';
import {SiGithub, SiGoogle, SiPatreon} from '@icons-pack/react-simple-icons';
import {userActions, useUserState} from '@lynx/redux/reducers/user';
import {AppDispatch} from '@lynx/redux/store';
import {LYNXHUB_WEBSITE} from '@lynx_common/consts';
import {getCacheUrl, getFallbackString} from '@lynx_common/utils';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import userIpc from '@lynx_shared/ipc/user';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {Refresh, User} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

const Profile_Account = memo(() => {
  const isLoggedIn = useUserState('isLoggedIn');
  const userData = useUserState('userData');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
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

  const syncAccount = useCallback(() => {
    AddBreadcrumb_Renderer(`Website Sync`);
    setIsSyncing(true);
    userIpc.account
      .getInfo()
      .then(data => {
        if (data) {
          dispatch(userActions.setUserState({key: 'userData', value: data}));
          dispatch(userActions.setUserState({key: 'isLoggedIn', value: true}));
          pluginsIpc.checkForSync(data.subscribeStage);
        } else {
          dispatch(userActions.resetUserState('userData'));
          dispatch(userActions.resetUserState('isLoggedIn'));
          pluginsIpc.checkForSync('public');
        }
      })
      .catch(e => {
        console.error(e);
      })
      .finally(() => {
        setIsSyncing(false);
      });
  }, [dispatch]);

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
              <Button
                size="sm"
                variant="secondary"
                isDisabled={isLoading || isSyncing}
                onPress={() => window.open(`${LYNXHUB_WEBSITE}/account`)}>
                Manage Account
              </Button>
              <Button
                size="sm"
                variant="secondary"
                isPending={isSyncing}
                onPress={syncAccount}
                isDisabled={isLoading || isSyncing}>
                {isSyncing ? (
                  <Spinner size="sm" color="current" />
                ) : (
                  <div className="flex items-center gap-1">
                    <Refresh className="size-3.5 shrink-0" />
                    <span>Sync</span>
                  </div>
                )}
              </Button>
              <Button
                size="sm"
                variant="danger-soft"
                isPending={isLoading}
                onPress={logoutAccount}
                isDisabled={isLoading || isSyncing}>
                {isLoading ? <Spinner size="sm" color="current" /> : 'Logout'}
              </Button>
            </>
          ) : (
            <Button size="sm" variant="primary" isPending={isLoading} isDisabled={isLoading} onPress={loginAccount}>
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

      {isLoggedIn && !userData.connectedProviders?.includes('patreon') && (
        <div
          className={
            'mx-5 mb-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 ' +
            'flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-orange-600 dark:text-orange-400'
          }>
          <div className="space-y-0.5">
            <p className="text-xs font-bold">Patreon Not Connected</p>
            <p className="text-[11px] text-muted-foreground/80 leading-normal">
              Connect your Patreon account on the website to unlock Early Access or Insider updates.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => window.open(`${LYNXHUB_WEBSITE}/account`)}
            className="font-bold shrink-0 self-start sm:self-center cursor-pointer">
            Connect Patreon
          </Button>
        </div>
      )}

      {isLoggedIn && userData.connectedProviders?.includes('patreon') && userData.subscribeStage === 'public' && (
        <div
          className={
            'mx-5 mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 ' +
            'flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-purple-600 dark:text-purple-400'
          }>
          <div className="space-y-0.5">
            <p className="text-xs font-bold">No Active Supporter Tier</p>
            <p className="text-[11px] text-muted-foreground/80 leading-normal">
              Upgrade your Patreon membership to get access to Early Access or Insider updates.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onPress={() => window.open(`${LYNXHUB_WEBSITE}/account`)}
            className="font-bold shrink-0 self-start sm:self-center cursor-pointer">
            Upgrade to Access
          </Button>
        </div>
      )}

      {isLoggedIn && (
        <div className="border-t border-border/30 mx-5 pb-1 space-y-2">
          <div className="flex flex-row flex-wrap gap-x-6 gap-y-2">
            {/* Google */}
            <div className="flex items-center gap-2">
              <SiGoogle className="size-3.5 text-foreground/80 shrink-0" />
              <span className="text-xs font-medium text-foreground">Google</span>
              <span
                className={
                  'text-[9px] font-bold text-success/80 bg-success/5 px-1.5 py-px ' +
                  'rounded-md border border-success/20'
                }>
                Primary
              </span>
            </div>

            {/* GitHub */}
            <div
              className={`flex items-center gap-2 ${
                userData.connectedProviders?.includes('github') ? 'opacity-100' : 'opacity-40'
              }`}>
              <SiGithub className="size-3.5 text-foreground/80 shrink-0" />
              <span className="text-xs font-medium text-foreground">GitHub</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-px rounded-md border ${
                  userData.connectedProviders?.includes('github')
                    ? 'text-success/80 bg-success/5 border-success/20'
                    : 'text-muted/65 border-border/20'
                }`}>
                {userData.connectedProviders?.includes('github') ? 'Linked' : 'Not Linked'}
              </span>
            </div>

            {/* Patreon */}
            <div
              className={`flex items-center gap-2 ${
                userData.connectedProviders?.includes('patreon') ? 'opacity-100' : 'opacity-40'
              }`}>
              <SiPatreon className="size-3.5 text-LynxPurple shrink-0" />
              <span className="text-xs font-medium text-foreground">Patreon</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-px rounded-md border ${
                  userData.connectedProviders?.includes('patreon')
                    ? 'text-success/80 bg-success/5 border-success/20'
                    : 'text-muted/65 border-border/20'
                }`}>
                {userData.connectedProviders?.includes('patreon') ? 'Linked' : 'Not Linked'}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
});

Profile_Account.displayName = 'Profile_Account';

export default Profile_Account;
