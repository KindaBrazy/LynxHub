import isEmpty from 'lodash/isEmpty';
import {memo} from 'react';

import {useExtensions} from '../../Extensions/ExtensionsContext';
import {useAppState} from '../../Redux/App/AppReducer';
import {ContentPagesButtons, SettingsPagesButtons} from './NavButtons';

const CONTAINER_WIDTH = 'w-[5.5rem]';

const NAV_BAR_STYLE = {
  bgColor: 'dark:bg-LynxRaisinBlack bg-white',
  gapY: 'gap-y-1',
  paddingY: 'py-3',
  shadow: 'shadow-sm',
  width: 'w-14',
};

const COMMON_STYLES =
  `${NAV_BAR_STYLE.width} ${NAV_BAR_STYLE.bgColor} ${NAV_BAR_STYLE.shadow} ${NAV_BAR_STYLE.paddingY}` +
  ` ${NAV_BAR_STYLE.gapY} flex relative min-h-16 flex-col flex-nowrap overflow-y-scroll rounded-full ` +
  `scrollbar-hide drop-shadow-md border border-foreground/5`;

/** Navigation bar containing two sections: Contents and Settings */
const NavBar = memo(() => {
  const navBar = useAppState('navBar');
  const {navBar: navBarExt} = useExtensions();

  if (!navBar) return null;

  if (navBarExt && navBarExt.NavBar) {
    const ExtNavBar = navBarExt.NavBar;
    return <ExtNavBar />;
  }

  return (
    <div className={`flex h-full ${CONTAINER_WIDTH} shrink-0 flex-col items-center justify-between pb-4 pt-3`}>
      {isEmpty(navBarExt?.ContentButtons) ? (
        <div className={`${COMMON_STYLES} max-h-[56%]`}>
          <ContentPagesButtons />
        </div>
      ) : (
        <navBarExt.ContentButtons />
      )}
      {isEmpty(navBarExt?.SettingsButtons) ? (
        <div className={`${COMMON_STYLES} sm:max-h-[35%] lg:max-h-[35%] xl:max-h-[40%]`}>
          <SettingsPagesButtons />
        </div>
      ) : (
        <navBarExt.SettingsButtons />
      )}
    </div>
  );
});

export default NavBar;
