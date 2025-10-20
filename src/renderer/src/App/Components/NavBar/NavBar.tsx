import {isEmpty} from 'lodash';
import {memo, useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useAppState} from '../../Redux/Reducer/AppReducer';
import {ContentPagesButtons, SettingsPagesButtons} from './NavButtons';

const CONTAINER_WIDTH = 'w-[5.5rem]';

/** Navigation bar containing two sections: Contents and Settings */
const NavBar = memo(() => {
  const navBar = useAppState('navBar');
  const {
    container: Container,
    contentBar: ContentBar,
    settingsBar: SettingsBar,
  } = useMemo(() => extensionsData.navBar.replace, []);

  if (!navBar) return null;

  if (Container) {
    return <Container />;
  }

  return (
    <div className={`flex h-full ${CONTAINER_WIDTH} shrink-0 flex-col items-center justify-between pb-4 pt-3`}>
      {isEmpty(ContentBar) ? (
        <div className="flex items-center justify-center">
          <ContentPagesButtons />
        </div>
      ) : (
        <ContentBar />
      )}
      {isEmpty(SettingsBar) ? (
        <div className="flex items-center justify-center">
          <SettingsPagesButtons />
        </div>
      ) : (
        <SettingsBar />
      )}
    </div>
  );
});

export default NavBar;
