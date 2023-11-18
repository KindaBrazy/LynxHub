// Import Packages
import React, {useContext, useEffect, useReducer, useState} from 'react';
import {AnimatePresence, motion, Variants} from 'framer-motion';
// Import modules
import {getBlack, getWhite, getWhiteFourth, getWhiteThird, RendererLogError, RendererLogInfo} from '../../../../AppState/AppConstants';
import StatusContext, {StatusContextType} from '../../GlobalStateContext';
import {ipcUserData} from '../../RendererIpcHandler';
import {getSDLaunchConfig} from '../../../../CrossProcessModules/SDLauncherConfig';
import {SDArgSetting, SDLaunchConfig, SettingComponentType} from '../../../../AppState/InterfaceAndTypes';
import {environmentVariables, sda1CommandLines} from '../../../../AppState/SDArgumentsContainer';
import {getArgumentKeyType} from '../../../../CrossProcessModules/SDArgumentsFunctions';
// Import components
import FilterSDLaunchSettings from '../FilterLaunchSettings/FilterSDLaunchSettings';
import SmoothScroll from '../../Customizable/SmoothScroll';
import SimpleCloseButton from '../../Customizable/SimpleCloseButton';
import LCheckBox from '../../Customizable/LCheckBox';
import OpenDialog from '../../Customizable/OpenDialog';
import DropDownMenu from '../../Customizable/DropDownMenu';
import LInputBox from '../../Customizable/LInputBox';
// Import Assets
import {FilterIcon} from '../../../../Assets/Icons/SvgIcons';

type Props = {
  // Toggle showing launch setting or Webui card
  ToggleSettings: () => void;
  // WebUi developer, GitHub repository username (Also will be used for Repository fetch url to use for identification, and id)
  repoUserName: string;
};

// Type of launch settings elements
type elementData = {
  CheckBox: Set<React.JSX.Element>;
  ChoosePath: Set<React.JSX.Element>;
  DropDown: Set<React.JSX.Element>;
  InputBox: Set<React.JSX.Element>;
};

// Launch data reducer dispatch types
type LaunchAction =
  | {
      type: 'ADD_ENV';
      name: {
        id: string;
        value: string;
      };
    }
  | {
      type: 'REMOVE_ENV';
      name: {
        id: string;
        value: string;
      };
    }
  | {
      type: 'ADD_CL';
      name: {
        id: string;
        value: string;
      };
    }
  | {
      type: 'REMOVE_CL';
      name: {
        id: string;
        value: string;
      };
    }
  | {
      type: 'CLEAR_CL';
    }
  | {
      type: 'NEW_DATA';
      data: SDLaunchConfig;
    };

const launchArgsReducer = (state: SDLaunchConfig, action: LaunchAction): SDLaunchConfig => {
  switch (action.type) {
    case 'ADD_ENV':
      if (state.env.includes(action.name)) return state;
      return {
        ...state,
        env: [...state.env, action.name],
      };
    case 'REMOVE_ENV':
      return {
        ...state,
        env: state.env.filter((item) => item.id !== action.name.id),
      };
    case 'ADD_CL':
      if (state.cl.includes(action.name)) return state;
      return {
        ...state,
        cl: [...state.cl, action.name],
      };
    case 'REMOVE_CL':
      return {
        ...state,
        cl: state.cl.filter((item) => item.id !== action.name.id),
      };
    case 'CLEAR_CL':
      return {
        ...state,
        cl: [],
      };
    case 'NEW_DATA':
      return action.data;
    default:
      return state;
  }
};

export default function WebUiSDLaunchSettings({repoUserName, ToggleSettings}: Props) {
  const {isDarkMode, setBlockBackground} = useContext(StatusContext) as StatusContextType;

  const [launchArgs, launchArgsDispatch] = useReducer(launchArgsReducer, getSDLaunchConfig());

  const [hoverSaveBtn, setHoverSaveBtn] = useState<boolean>();
  const [showListMenu, setShowListMenu] = useState<boolean>(false);
  const [dataToSave, setDataToSave] = useState<SDLaunchConfig>(getSDLaunchConfig());
  const [dataToShow, setDataToShow] = useState<elementData>({
    CheckBox: new Set<React.JSX.Element>(),
    ChoosePath: new Set<React.JSX.Element>(),
    DropDown: new Set<React.JSX.Element>(),
    InputBox: new Set<React.JSX.Element>(),
  });

  useEffect(() => {
    // Read webui launch the config object from backend and initialize sda1LaunchArg state with it
    ipcUserData
      .getLaunchData(repoUserName)
      .then((value: SDLaunchConfig) => {
        launchArgsDispatch({type: 'NEW_DATA', data: value});
        return null;
      })
      .catch((error) => {
        console.log(RendererLogError(error));
      });

    // Update sda1LaunchArg every time webui launch config changed
    ipcUserData.onLaunchDataChange((_event, args) => {
      launchArgsDispatch({type: 'NEW_DATA', data: args});
    });
  }, []);

  // Save launch settings to the batch file and close the settings menu
  const SaveSettings = () => {
    launchArgsDispatch({type: 'NEW_DATA', data: dataToSave});
    ipcUserData.saveLaunchArgsToFile(dataToSave, repoUserName);
    ToggleSettings();
  };

  /**
   * Handles changes to settings.
   * First check setting type is 'env' or 'cl', then checks if the id exists it updates the value, otherwise it adds a new item with the id and value.
   *
   * @param {('env' | 'cl')} settingType - The type of the setting.
   * @param {string} id - The id of the setting.
   * @param {string} value - The new value of the setting.
   */
  function handleSettingChange(settingType: 'env' | 'cl', id: string, value: string): void {
    setDataToSave((prevState: SDLaunchConfig) => {
      // Check if the setting already exists.
      const settingExists: boolean = prevState[settingType].some((setting: {id: string; value: string}): boolean => setting.id === id);

      // If the setting exists, update its value. Otherwise, add the new setting.
      const updatedSettings: {
        id: string;
        value: string;
      }[] = settingExists
        ? prevState[settingType].map(
            (setting: {
              id: string;
              value: string;
            }): {
              id: string;
              value: string;
            } => (setting.id === id ? {...setting, value} : setting),
          )
        : [...prevState[settingType], {id, value}];

      // Update the state with the new settings.
      const resultData = {...prevState, [settingType]: updatedSettings};

      console.log(RendererLogInfo(JSON.stringify(resultData)));

      return resultData;
    });
  }

  /**
   * Handles the change of a component's value.
   * @param {('checkbox' | 'string')} type - The type of the component.
   * @param {string} id - The id of the launch setting.
   * @param {string} value - The value of the launch setting.
   */
  function handleCompChange(type: 'checkbox' | 'string', id: string, value: string) {
    const settingType: 'env' | 'cl' | undefined = getArgumentKeyType(id);

    if (settingType) {
      switch (type) {
        case 'checkbox':
          handleSettingChange(settingType, id, value);
          break;
        case 'string':
          if (value) handleSettingChange(settingType, id, value);
          break;
        default:
          break;
      }
    } else {
      console.log(RendererLogError("Can't find settingType of changed id"));
    }
  }

  /**
   * Get a component based on the type of setting provided.
   * Also handle the change events for different types of components.
   *
   * @param {SDArgSetting} setting - The setting based on which the component is to be fetched.
   * @param {Object} currentData - The current data of the component.
   * @param {string} currentData.id - The current id of the component.
   * @param {string} currentData.value - The current value of the component.
   */
  function fetchComponentBySettingType(
    setting: SDArgSetting,
    currentData?: {
      id: string;
      value: string;
    },
  ) {
    // Handle checkbox change
    const onCheckBoxChange = (
      name: {
        id: string;
        value: string;
      },
      enabled: boolean,
    ) => {
      handleCompChange('checkbox', name.id, `CheckBox-${enabled}`);
    };

    // Handle text change
    const onTextChange = (id: string, value: string) => {
      handleCompChange('string', id, value);
    };

    /* Handle different types of settings */

    switch (setting.Type) {
      case SettingComponentType.CheckBox: {
        const element: React.JSX.Element = (
          <LCheckBox
            onValueChange={onCheckBoxChange}
            highlightEnabled={false}
            key={setting.Name}
            name={setting.Name}
            defaultEnabled={currentData?.value === 'CheckBox-true'}
          />
        );
        setDataToShow((prevState: elementData) => ({...prevState, CheckBox: new Set([...prevState.CheckBox, element])}));
        break;
      }

      case SettingComponentType.ChooseDirectory: {
        const element: React.JSX.Element = (
          <OpenDialog
            defaultDir={currentData?.value}
            onValueChange={onTextChange}
            placeHolder={setting.Description}
            categoryText={setting.Name}
            key={setting.Name}
            type="directory"
          />
        );
        setDataToShow((prevState: elementData) => ({...prevState, ChoosePath: new Set([...prevState.ChoosePath, element])}));
        break;
      }

      case SettingComponentType.ChooseFile: {
        const element: React.JSX.Element = (
          <OpenDialog
            defaultDir={currentData?.value}
            onValueChange={onTextChange}
            placeHolder={setting.Description}
            categoryText={setting.Name}
            key={setting.Name}
            type="file"
          />
        );
        setDataToShow((prevState: elementData) => ({...prevState, ChoosePath: new Set([...prevState.ChoosePath, element])}));
        break;
      }

      case SettingComponentType.DropDown: {
        const DropDowItems: {
          id: string;
          text: string;
        }[] = [];
        if (setting.Values) {
          Object.keys(setting.Values).forEach((key) => {
            // @ts-ignore
            DropDowItems.push({text: setting.Values[key], id: setting.Values[key]});
          });
        }
        const element: React.JSX.Element = (
          <DropDownMenu
            defaultSelectedItem={currentData?.value}
            onValueChange={onTextChange}
            key={setting.Name}
            categoryText={setting.Name}
            id={setting.Name}
            items={DropDowItems}
          />
        );
        setDataToShow((prevState: elementData) => ({...prevState, DropDown: new Set([...prevState.DropDown, element])}));
        break;
      }

      case SettingComponentType.InputBox: {
        const element: React.JSX.Element = (
          <LInputBox
            defaultValue={currentData?.value}
            autoFocus={false}
            onValueChange={onTextChange}
            key={setting.Name}
            name={setting.Name}
            hintText={setting.Description}
          />
        );
        setDataToShow((prevState: elementData) => ({...prevState, InputBox: new Set([...prevState.InputBox, element])}));
        break;
      }
      default: {
        break;
      }
    }
  }

  /**
   * Initialize the data to save and show, and fetch the components based on the launch arguments.
   * Also set the default value for checkboxes if not provided.
   */
  useEffect(() => {
    // Initialize data to save and show
    setDataToSave(launchArgs);
    setDataToShow({
      CheckBox: new Set<React.JSX.Element>(),
      ChoosePath: new Set<React.JSX.Element>(),
      DropDown: new Set<React.JSX.Element>(),
      InputBox: new Set<React.JSX.Element>(),
    });

    console.log(` -> ${JSON.stringify(launchArgs)}`);
    // Fetch components for environment variables
    launchArgs.env.forEach((envVar: {id: string; value: string}): void => {
      if (envVar.id !== 'COMMANDLINE_ARGS') {
        if (environmentVariables[envVar.id].Type === SettingComponentType.CheckBox && envVar.value === '') {
          envVar.value = 'CheckBox-false';
        }
        fetchComponentBySettingType(environmentVariables[envVar.id], envVar);
      }
    });

    // Fetch components for command line arguments
    launchArgs.cl.forEach((clArg: {id: string; value: string}): void => {
      ['Configuration', 'Performance', 'Features'].some((key: string) => {
        const foundKey = Object.keys(sda1CommandLines[key]).find((childKey: string) => sda1CommandLines[key][childKey].Name === clArg.id);
        if (foundKey) {
          if (sda1CommandLines[key][foundKey].Type === SettingComponentType.CheckBox && clArg.value === '') {
            clArg.value = 'CheckBox-false';
          }
          fetchComponentBySettingType(sda1CommandLines[key][foundKey], clArg);
        }
        return !!foundKey;
      });
    });
  }, [launchArgs]);

  // Toggle the visibility of the list menu and the background block.
  const ShowListSelect = () => {
    setBlockBackground((prevState) => !prevState);
    setShowListMenu((prevState) => !prevState);
  };

  const [scrollKey, setScrollKey] = useState<number>(0);
  const [newData, setNewData] = useState<React.JSX.Element[]>([]);

  /**
   * Update the display data based on the data to show.
   * Also increment the scroll key to trigger a re-render.
   */
  useEffect(() => {
    setNewData([...dataToShow.ChoosePath, ...dataToShow.DropDown, ...dataToShow.InputBox]);

    if (dataToShow.CheckBox.size !== 0) {
      const checkBoxElements: React.JSX.Element[] = Array.from(dataToShow.CheckBox);
      setNewData((prevState) => [
        ...prevState,
        <div key="TestKey" className="mt-2 flex w-[95%] flex-row flex-wrap bg-red-600/0">
          {checkBoxElements.map((value) => value)}
        </div>,
      ]);
    }

    setScrollKey((prevState) => prevState + 1);
  }, [dataToShow]);

  // Save button motion animation variants
  const buttonVariantsSettings: Variants = {
    hover: {
      borderColor: isDarkMode ? getWhite(0.4) : getBlack(0.7),
      backgroundColor: isDarkMode ? getBlack(0.5) : getWhiteFourth(0.7),
      color: isDarkMode ? getWhite() : getBlack(),
      transition: {
        duration: 0.3,
        type: 'spring',
      },
    },
    tap: {
      borderColor: isDarkMode ? getWhite(0.2) : getBlack(0.3),
      backgroundColor: isDarkMode ? getBlack(0.3) : getWhite(0.3),
      scale: 0.95,
      borderRadius: '20px',
      transition: {
        duration: 0.1,
        type: 'spring',
      },
    },
    animate: {
      borderColor: isDarkMode ? getBlack(0.3) : getWhiteFourth(),
      backgroundColor: isDarkMode ? getBlack(0.2) : getWhiteThird(0.6),
      color: isDarkMode ? getWhite(0.8) : getBlack(0.9),
      scale: 1,
      transition: {
        duration: 0.3,
        type: 'spring',
      },
    },
  };

  return (
    <>
      <motion.div
        initial={{translateY: '-500px', opacity: 0, scale: 0.5}}
        animate={{translateY: '0px', opacity: 1, scale: 1, transition: {duration: 0.4, ease: 'backOut'}}}
        exit={{translateY: '-500px', opacity: 0, scale: 0.5, transition: {duration: 0.3, ease: 'backIn'}}}
        className="absolute inset-y-5 left-4 right-4 z-20 flex flex-col items-center overflow-hidden
         rounded-2xl bg-white/60 shadow-SideBar backdrop-blur-3xl dark:bg-LynxRaisinBlack/80">
        {/* Close button */}
        <SimpleCloseButton
          onClick={() => {
            launchArgsDispatch({type: 'NEW_DATA', data: dataToSave});
            ToggleSettings();
          }}
        />

        {/* Title */}
        <span className="mt-4 h-[70px] w-full text-center text-3xl font-semibold">Launch Settings</span>

        {/* Filter settings */}
        <motion.div
          initial={{borderRadius: '0.5rem'}}
          whileHover={{backgroundColor: isDarkMode ? getBlack(0.4) : getWhiteFourth(), transition: {duration: 0.3}}}
          whileTap={{scale: 0.9, borderRadius: '0.7rem', transition: {duration: 0.1, type: 'spring'}}}
          animate={{backgroundColor: isDarkMode ? getBlack(0) : getWhiteFourth(0)}}
          onClick={ShowListSelect}
          className="absolute left-2 top-2 p-1">
          <FilterIcon
            className="h-[25px] w-[25px] fill-black stroke-black/50 transition duration-300 hover:stroke-black
          dark:fill-white dark:stroke-white/50 dark:hover:stroke-white"
          />
        </motion.div>

        {/* Launch settings data */}
        <SmoothScroll key={`SettingsWebuiScroll${scrollKey}`}>
          {newData.map((value) => {
            return value;
          })}
        </SmoothScroll>
        <div className="flex h-[5rem] w-full items-center justify-around">
          {/* Save data button */}
          <motion.div
            onMouseEnter={() => setHoverSaveBtn(true)}
            onMouseLeave={() => setHoverSaveBtn(false)}
            variants={buttonVariantsSettings}
            whileHover="hover"
            whileTap="tap"
            animate="animate"
            onClick={SaveSettings}
            className="my-8 flex h-[70%] w-[80%] items-center justify-center rounded-xl border outline-none">
            <span
              className={`cursor-default select-none text-xl font-semibold transition duration-300 ${
                hoverSaveBtn ? 'text-LynxPurple' : 'text-LynxBlue'
              }`}>
              Save
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Filter launch settings menu */}
      <AnimatePresence>
        {showListMenu && <FilterSDLaunchSettings launchArgs={launchArgs} launchArgsDispatch={launchArgsDispatch} setShowListMenu={setShowListMenu} />}
      </AnimatePresence>
    </>
  );
}
