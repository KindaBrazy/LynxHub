import {Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@nextui-org/react';
import {motion} from 'framer-motion';

import {APP_ICON_TRANSPARENT, APP_NAME, APP_NAME_VERSION_V} from '../../../../../cross/CrossConstants';
import {getIconByName} from '../../../assets/icons/SvgIconsContainer';
import {useAppState} from '../../Redux/App/AppReducer';
import rendererIpc from '../../RendererIpc';
import {getColor} from '../../Utils/Constants';
import LynxTooltip from '../Reusable/LynxTooltip';

const changeWindowState = (operation: 'fullscreen' | 'minimize' | 'maximize' | 'close') => {
  rendererIpc.win.changeWinState(operation);
};

const AppNameStyle = {fontSize: 'text-[12pt]'};

/** App icon and name with dropdown functionality. */
export default function Logo() {
  const darkMode = useAppState('darkMode');
  const onFocus = useAppState('onFocus');
  const maximized = useAppState('maximized');

  return (
    <>
      <Dropdown shadow="sm">
        <DropdownTrigger>
          {/*#region App Icon */}
          <img
            className={
              `notDraggable ml-2 size-5 transition duration-300` +
              ` hover:scale-110 ${onFocus ? 'opacity-100' : 'opacity-50'}`
            }
            alt="App Icon"
            src={APP_ICON_TRANSPARENT}
          />
          {/*#endregion */}
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownSection>
            {/*#region Maximize */}
            <DropdownItem
              onClick={() => {
                changeWindowState('maximize');
              }}
              startContent={
                maximized
                  ? getIconByName('UnMaximize', {className: `${darkMode ? 'fill-white' : 'fill-black'} size-3`})
                  : getIconByName('Maximize', {className: `${darkMode ? 'fill-white' : 'fill-black'} size-3`})
              }
              className="cursor-default"
              key={maximized ? 'unmaximize' : 'maximize'}>
              {maximized ? 'Unmaximize' : 'Maximize'}
            </DropdownItem>
            {/*#endregion */}

            {/*#region Minimize */}
            <DropdownItem
              onClick={() => {
                changeWindowState('minimize');
              }}
              startContent={getIconByName('Minimize', {
                className: `${darkMode ? 'fill-white' : 'fill-black'} size-3`,
              })}
              key="minimize"
              className="cursor-default">
              Minimize
            </DropdownItem>
            {/*#endregion */}

            {/*#region Close */}
            <DropdownItem
              onClick={() => {
                changeWindowState('close');
              }}
              key="close"
              color="danger"
              className="cursor-default"
              startContent={getIconByName('Power', {className: `${darkMode ? 'fill-white' : 'fill-black'} size-3`})}>
              Close
            </DropdownItem>
            {/*#endregion */}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>

      {/*#region App Name */}
      <LynxTooltip delay={500} content={APP_NAME_VERSION_V}>
        <motion.span
          animate={{
            color: darkMode ? getColor('white') : getColor('black'),
            opacity: onFocus ? 1 : 0.5,
            transition: {duration: 0.2},
          }}
          transition={{duration: 0.4}}
          className={`notDraggable ml-2 ${AppNameStyle.fontSize}`}
          whileTap={{color: darkMode ? getColor('white', 0.8) : getColor('black', 0.6)}}>
          {APP_NAME}
        </motion.span>
      </LynxTooltip>
      {/*#endregion */}
    </>
  );
}
