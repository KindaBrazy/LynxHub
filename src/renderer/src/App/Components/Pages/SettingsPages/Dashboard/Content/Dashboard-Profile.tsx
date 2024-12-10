import {Card, Group, Overlay, Text} from '@mantine/core';
import {Button, Checkbox, User} from '@nextui-org/react';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {PatreonUserData} from '../../../../../../../../cross/CrossTypes';
import {User_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons3';
import {Google_Icon, Patreon_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons4';
import {useAppState} from '../../../../../Redux/App/AppReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import {userActions, useUserState} from '../../../../../Redux/User/UserReducer';
import SettingsSection from '../../Settings/SettingsPage-ContentSection';

export const DashboardProfileId = 'settings_profile_elem';

export default function DashboardProfile() {
  const darkMode = useAppState('darkMode');

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
          console.log(userData);
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
    setIsLoading(true);
    window.electron.ipcRenderer.invoke('patreon-logout').then(() => {
      setIsLoading(false);
      dispatch(userActions.resetUserState('patreonUserData'));
      dispatch(userActions.resetUserState('patreonLoggedIn'));
    });
  }, []);

  const cancelLoading = () => {
    setIsLoading(false);
    window.electron.ipcRenderer.send('patreon-cancel-process');
  };

  return (
    <SettingsSection title="Profiles" id={DashboardProfileId} icon={<User_Icon className="size-5" />}>
      <Card shadow="sm" radius="lg" className={`${patreonLoggedIn && '!border-success/70'}`} withBorder>
        <div className="mb-3 flex flex-row items-center space-x-1.5">
          <Patreon_Icon className="text-large" />
          <Text fw={500}>Patreon</Text>
        </div>
        <Group justify="space-between">
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
        </Group>
      </Card>

      <Card shadow="sm" radius="lg" withBorder>
        <div className="mb-3 flex flex-row items-center space-x-1.5">
          <Google_Icon className="text-large" />
          <Text fw={500}>Google</Text>
        </div>
        <Group justify="space-between">
          <User name="Guest" />
          <Button size="sm" variant="flat" color="success">
            Login
          </Button>
        </Group>
        <div className="mt-4 flex flex-row justify-between">
          <Checkbox size="sm">Sync Data with Cloud</Checkbox>
        </div>
        <Overlay
          backgroundOpacity={0.8}
          color={darkMode ? '#212121' : '#fff'}
          className="texm content-center text-center">
          Coming Soon...
        </Overlay>
      </Card>
    </SettingsSection>
  );
}
