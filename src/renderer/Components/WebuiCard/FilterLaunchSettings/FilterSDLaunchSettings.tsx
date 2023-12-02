// Import packages
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {AnimatePresence, motion, Variants} from 'framer-motion';
// Import components
import SimpleCloseButton from '../../Customizable/SimpleCloseButton';
import ListItemComp from './ListItemComp';
import FullTitleComp from './SubComps/FullTitleComp';
import SubTitleComp from './SubComps/SubTitleComp';
import LInputBox from '../../Customizable/LInputBox';
// Import modules
import {getBlack, getWhiteFourth} from '../../../../AppState/AppConstants';
import {SDArgSetting, SDLaunchConfig} from '../../../../AppState/InterfaceAndTypes';
import {environmentVariables, sda1CommandLines} from '../../../../AppState/SDArgumentsContainer';
import StatusContext, {StatusContextType} from '../../GlobalStateContext';
// Import assets
import {SearchIcon} from '../../../../Assets/Icons/SvgIcons';
import LScrollBar from '../../Customizable/LScrollBar';

type Props = {
  launchArgs: SDLaunchConfig;
  launchArgsDispatch: React.Dispatch<any>;
  // Callback to close this component
  setShowListMenu: (value: boolean) => void;
};

// Component brings in and out motion animation variants
const pageVariants: Variants = {
  comeIn: {opacity: 1, scale: 1, transition: {duration: 0.4, ease: 'backOut'}},
  comeOut: {opacity: 0, scale: 0.5, transition: {duration: 0.2, ease: 'backIn'}},
};

// Search box motion animation variants
const searchBoxAnimation: Variants = {
  initial: {scale: 0.5, opacity: 0},
  animate: {scale: 1, opacity: 1, transition: {duration: 0.2, ease: 'backOut', delay: 0.1}},
  exit: {scale: 0.5, opacity: 0, transition: {duration: 0.2, ease: 'backIn'}},
};

/**
 * Check if the setting's name or description includes the provided string.
 * Also checks if the setting's values include the provided string.
 *
 * @param {SDArgSetting} setting - The setting to be checked.
 * @param {string} searchString - The string to be searched for.
 * @returns {boolean} - Returns true if the string is found, false otherwise.
 */
function doesSettingIncludeString(setting: SDArgSetting, searchString: string): boolean {
  if (!setting || searchString === '') return false;

  const lowerCaseSearchString = searchString.toLowerCase();

  // Check if the setting's name or description includes the search string
  if (setting.Name.toLowerCase().includes(lowerCaseSearchString) || setting.Description.toLowerCase().includes(lowerCaseSearchString)) return true;

  let multipleStringFind: boolean = true;
  lowerCaseSearchString.split(' ').find((value) => {
    const result: boolean = !setting.Name.toLowerCase().includes(value);
    if (result) multipleStringFind = false;
    return result;
  });
  lowerCaseSearchString.split(' ').find((value) => {
    const result: boolean = !setting.Description.toLowerCase().includes(value);
    if (result) multipleStringFind = false;
    return result;
  });
  if (multipleStringFind) return true;

  // Check if the setting's values include the search string
  if (setting.Values) {
    const lowerCaseValues = Object.values(setting.Values).map((value) => value.toLowerCase());
    return lowerCaseValues.includes(lowerCaseSearchString);
  }

  return false;
}

const envProperties: string[] = Object.keys(environmentVariables);
const configurationProperties: string[] = Object.keys(sda1CommandLines.Configuration);
const performanceProperties: string[] = Object.keys(sda1CommandLines.Performance);
const featureProperties: string[] = Object.keys(sda1CommandLines.Features);

export default function FilterSDLaunchSettings({setShowListMenu, launchArgs, launchArgsDispatch}: Props) {
  const {setBlockBackground, isDarkMode} = useContext(StatusContext) as StatusContextType;

  useEffect(() => {
    console.log(`** -> ${JSON.stringify(launchArgs)}`);
  }, []);

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [clEnabled, setClEnabled] = useState<boolean>(launchArgs.env.some((value) => value.id.includes('COMMANDLINE_ARGS')));

  // Update launch data based on the provided type.
  function updateLaunchData(type: 'env' | 'cl', arg: {id: string; value: string}, isEnabled: boolean) {
    if (type === 'env') {
      if (arg.id === 'COMMANDLINE_ARGS') setClEnabled(isEnabled);
      launchArgsDispatch({type: isEnabled ? 'ADD_ENV' : 'REMOVE_ENV', name: arg});
    } else if (type === 'cl') {
      launchArgsDispatch({type: isEnabled ? 'ADD_CL' : 'REMOVE_CL', name: arg});
    }
  }

  // Update launch settings
  const updateLaunchSettings = (arg: string, enabled: boolean) => {
    let isFound: boolean = false;

    // Find in environment properties
    envProperties.find((value: string) => {
      if (arg === environmentVariables[value].Name) {
        isFound = true;
        updateLaunchData('env', {id: arg, value: ''}, enabled);
      }
      return isFound;
    });

    // If not found in environment properties
    if (!isFound) {
      [
        {data: configurationProperties, type: 'Configuration'},
        {data: performanceProperties, type: 'Performance'},
        {data: featureProperties, type: 'Features'},
      ].find((value) => {
        value.data.find((childValue) => {
          const propertyValue: SDArgSetting = sda1CommandLines[value.type][childValue];
          if (arg === propertyValue.Name) {
            isFound = true;
            updateLaunchData('cl', {id: arg, value: ''}, enabled);
          }
          return isFound;
        });
        return isFound;
      });
    }
  };

  /* Utilize useMemo to optimize performance by memorizing the result of envListElements
   * This prevents unnecessary re-renders when the dependencies [environmentVariables, searchValue, clEnabled] have not changed */
  const envListElements = useMemo(() => {
    return envProperties.map((envKey: string) => {
      const envVar = environmentVariables[envKey];
      const {Name, Description} = envVar;

      // Filter out the settings that do not include the search string
      if (searchValue !== '' && !doesSettingIncludeString(envVar, searchValue)) {
        return null;
      }

      // Determine if the setting is enabled based on its name
      const isEnabled = Name === 'COMMANDLINE_ARGS' ? clEnabled : launchArgs.env.some(({id}) => id.includes(Name));

      return <ListItemComp onValueChange={updateLaunchSettings} key={Name} name={Name} defaultEnabled={isEnabled} description={Description} />;
    });
  }, [environmentVariables, searchValue, clEnabled]);

  // Similar memorization is done for clConfigurationElements, clPerformanceElements, and clFeaturesElements
  const generateListItems = (properties: string[], values: any) => {
    return properties.map((propertyName: string) => {
      const propertyValue: SDArgSetting = values[propertyName as keyof typeof values];
      const {Name, Description} = propertyValue;

      if (searchValue !== '' && !doesSettingIncludeString(propertyValue, searchValue)) {
        return null;
      }

      const isEnabled = launchArgs.cl.some(({id}) => id.includes(Name));

      return <ListItemComp onValueChange={updateLaunchSettings} key={Name} name={Name} defaultEnabled={isEnabled} description={Description} />;
    });
  };

  const clConfigurationElements = useMemo(
    () => generateListItems(configurationProperties, sda1CommandLines.Configuration),
    [configurationProperties, searchValue],
  );
  const clPerformanceElements = useMemo(
    () => generateListItems(performanceProperties, sda1CommandLines.Performance),
    [performanceProperties, searchValue],
  );
  const clFeaturesElements = useMemo(() => generateListItems(featureProperties, sda1CommandLines.Features), [featureProperties, searchValue]);

  // Close self component
  const closeHandle = () => {
    if (!clEnabled) {
      launchArgsDispatch({type: 'CLEAR_CL'});
    }
    setShowListMenu(false);
    setBlockBackground((prevState) => !prevState);
  };

  const toggleSearch = () => {
    setIsSearching((prevState) => !prevState);
  };

  // Memorizing the result of newData this prevents unnecessary re-renders when the dependencies [clEnabled, searchValue] have not changed
  const newData = useMemo(() => {
    // Initialize an empty array to store the JSX elements
    const elements: React.JSX.Element[] = [];

    // If there is no search value, add the "Environment Variables" title
    if (searchValue === '') {
      elements.push(<FullTitleComp key="Environment Variables" name="Environment Variables" revealAnimation />);
    }

    // Add all environment list elements to the array
    envListElements.forEach((value) => {
      if (value) elements.push(value);
    });

    // If command line arguments are enabled, add the relevant elements
    if (clEnabled) {
      if (searchValue === '') {
        elements.push(<FullTitleComp key="CommandLine Arguments" name="CommandLine Arguments" revealAnimation />);
        elements.push(<SubTitleComp key="Configuration :" name="Configuration :" revealAnimation />);
      }

      // Add all configuration elements to the array
      clConfigurationElements.forEach((value) => {
        if (value) elements.push(value);
      });

      if (searchValue === '') {
        elements.push(<SubTitleComp key="Performance :" name="Performance :" revealAnimation />);
      }

      // Add all performance elements to the array
      clPerformanceElements.forEach((value) => {
        if (value) elements.push(value);
      });

      if (searchValue === '') {
        elements.push(<SubTitleComp key="Features :" name="Features :" revealAnimation />);
      }

      // Add all feature elements to the array
      clFeaturesElements.forEach((value) => {
        if (value) elements.push(value);
      });
    }

    return elements;
  }, [clEnabled, searchValue]);

  return (
    <motion.div
      variants={pageVariants}
      initial="comeOut"
      animate="comeIn"
      exit="comeOut"
      className="fixed inset-x-10 bottom-8 top-16 !z-[70] flex flex-col
      items-center overflow-hidden rounded-2xl bg-white/30 shadow-SideBar backdrop-blur-2xl dark:bg-LynxRaisinBlack/[98%]">
      <div className="flex h-20 w-full items-center justify-center">
        {/* Close button */}
        <SimpleCloseButton onClick={closeHandle} />

        {/* Search box */}
        <AnimatePresence>
          {isSearching && (
            <LInputBox
              setValue={setSearchValue}
              animVariants={searchBoxAnimation}
              hintText="Search for names, descriptions and values ..."
              extraClasses="!w-[85%] !mt-0"
            />
          )}
        </AnimatePresence>

        {/* If not searching, show component title */}
        <AnimatePresence>
          {!isSearching && (
            <motion.span
              initial={{scale: 0.5, opacity: 0}}
              animate={{scale: 1, opacity: 1, transition: {duration: 0.2, ease: 'backOut', delay: 0.1}}}
              exit={{scale: 0.5, opacity: 0, transition: {duration: 0.2, ease: 'backIn'}}}
              className="absolute text-3xl font-semibold">
              Arguments and Variables
            </motion.span>
          )}
        </AnimatePresence>

        {/* Search button toggle */}
        <motion.div
          initial={{borderRadius: '0.5rem'}}
          whileHover={{backgroundColor: isDarkMode ? getBlack(0.4) : getWhiteFourth(), transition: {duration: 0.3}}}
          whileTap={{scale: 0.9, borderRadius: '0.7rem', transition: {duration: 0.1, type: 'spring'}}}
          animate={{backgroundColor: isDarkMode ? getBlack(0) : getWhiteFourth(0)}}
          onClick={toggleSearch}
          className="absolute left-2 top-2 p-1">
          <SearchIcon
            className="h-[25px] w-[25px] fill-black stroke-black/50 transition duration-300
          hover:stroke-black dark:fill-white dark:stroke-white/50 dark:hover:stroke-white"
          />
        </motion.div>
      </div>

      {/* Setting items to show */}
      <LScrollBar extraClassName="pb-4 pt-2">
        <div className="flex w-full flex-col items-center">{newData.map((value) => value)}</div>
      </LScrollBar>
    </motion.div>
  );
}
