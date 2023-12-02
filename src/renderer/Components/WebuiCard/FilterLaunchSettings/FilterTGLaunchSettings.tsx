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
import {TGArgSetting, TGLaunchConfig} from '../../../../AppState/InterfaceAndTypes';
import StatusContext, {StatusContextType} from '../../GlobalStateContext';
// Import assets
import {SearchIcon} from '../../../../Assets/Icons/SvgIcons';
import {commandLineFlags} from '../../../../AppState/TGArgumentsContainer';
import LScrollBar from '../../Customizable/LScrollBar';

type Props = {
  launchArgs: TGLaunchConfig;
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
 * @param {TGArgSetting} setting - The setting to be checked.
 * @param {string} searchString - The string to be searched for.
 * @returns {boolean} - Returns true if the string is found, false otherwise.
 */
function doesSettingIncludeString(setting: TGArgSetting, searchString: string): boolean {
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

const propertiesBasicSettings: string[] = Object.keys(commandLineFlags.BasicSettings);
const propertiesModelLoader: string[] = Object.keys(commandLineFlags.ModelLoader);
const propertiesAccelerateTransformers: string[] = Object.keys(commandLineFlags.AccelerateTransformers);
const propertiesAccelerate4bit: string[] = Object.keys(commandLineFlags.Accelerate4bit);
const propertiesGGUF: string[] = Object.keys(commandLineFlags.GGUF);
const propertiesLlamaCpp: string[] = Object.keys(commandLineFlags.LlamaCpp);
const propertiesCTransformers: string[] = Object.keys(commandLineFlags.CTransformers);
const propertiesAutoGPTQ: string[] = Object.keys(commandLineFlags.AutoGPTQ);
const propertiesExLlama: string[] = Object.keys(commandLineFlags.ExLlama);
const propertiesGPTQForLLaMa: string[] = Object.keys(commandLineFlags.GPTQForLLaMa);
const propertiesDeepSpeed: string[] = Object.keys(commandLineFlags.DeepSpeed);
const propertiesRWKV: string[] = Object.keys(commandLineFlags.RWKV);
const propertiesRoPE: string[] = Object.keys(commandLineFlags.RoPE);
const propertiesGradio: string[] = Object.keys(commandLineFlags.Gradio);
const propertiesAPI: string[] = Object.keys(commandLineFlags.API);
const propertiesMultimodal: string[] = Object.keys(commandLineFlags.Multimodal);

export default function FilterTGLaunchSettings({setShowListMenu, launchArgs, launchArgsDispatch}: Props) {
  const {setBlockBackground, isDarkMode} = useContext(StatusContext) as StatusContextType;

  useEffect(() => {
    console.log(`** -> ${JSON.stringify(launchArgs)}`);
  }, []);

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');

  // Update launch data based on the provided type.
  function updateLaunchData(arg: {id: string; value: string}, isEnabled: boolean) {
    launchArgsDispatch({type: isEnabled ? 'ADD_CL' : 'REMOVE_CL', name: arg});
  }

  // Update launch settings
  const updateLaunchSettings = (arg: string, enabled: boolean) => {
    let isFound: boolean = false;

    // If not found in environment properties
    if (!isFound) {
      [
        {data: propertiesBasicSettings, type: 'BasicSettings'},
        {data: propertiesModelLoader, type: 'ModelLoader'},
        {data: propertiesAccelerateTransformers, type: 'AccelerateTransformers'},
        {data: propertiesAccelerate4bit, type: 'Accelerate4bit'},
        {data: propertiesGGUF, type: 'GGUF'},
        {data: propertiesLlamaCpp, type: 'LlamaCpp'},
        {data: propertiesCTransformers, type: 'CTransformers'},
        {data: propertiesAutoGPTQ, type: 'AutoGPTQ'},
        {data: propertiesExLlama, type: 'ExLlama'},
        {data: propertiesGPTQForLLaMa, type: 'GPTQForLLaMa'},
        {data: propertiesDeepSpeed, type: 'DeepSpeed'},
        {data: propertiesRWKV, type: 'RWKV'},
        {data: propertiesRoPE, type: 'RoPE'},
        {data: propertiesGradio, type: 'Gradio'},
        {data: propertiesAPI, type: 'API'},
        {data: propertiesMultimodal, type: 'Multimodal'},
      ].find((value) => {
        value.data.find((childValue) => {
          const propertyValue: TGArgSetting = commandLineFlags[value.type][childValue];
          if (arg === propertyValue.Name) {
            isFound = true;
            updateLaunchData({id: arg, value: ''}, enabled);
          }
          return isFound;
        });
        return isFound;
      });
    }
  };

  // Similar memorization is done for clConfigurationElements, clPerformanceElements, and clFeaturesElements
  const generateListItems = (properties: string[], values: any) => {
    return properties.map((propertyName: string) => {
      const propertyValue: TGArgSetting = values[propertyName as keyof typeof values];
      const {Name, Description} = propertyValue;

      if (searchValue !== '' && !doesSettingIncludeString(propertyValue, searchValue)) {
        return null;
      }

      const isEnabled = launchArgs.flags.some(({id}) => id.includes(Name));

      return <ListItemComp onValueChange={updateLaunchSettings} key={Name} name={Name} defaultEnabled={isEnabled} description={Description} />;
    });
  };

  const flagBasicSettingsElements = useMemo(
    () => generateListItems(propertiesBasicSettings, commandLineFlags.BasicSettings),
    [propertiesBasicSettings, searchValue],
  );
  const flagModelLoaderElements = useMemo(
    () => generateListItems(propertiesModelLoader, commandLineFlags.ModelLoader),
    [propertiesModelLoader, searchValue],
  );
  const flagAccelerateTransformersElements = useMemo(
    () => generateListItems(propertiesAccelerateTransformers, commandLineFlags.AccelerateTransformers),
    [propertiesAccelerateTransformers, searchValue],
  );
  const flagAccelerate4bitElements = useMemo(
    () => generateListItems(propertiesAccelerate4bit, commandLineFlags.Accelerate4bit),
    [propertiesAccelerate4bit, searchValue],
  );
  const flagGGUFElements = useMemo(() => generateListItems(propertiesGGUF, commandLineFlags.GGUF), [propertiesGGUF, searchValue]);
  const flagLlamaCppElements = useMemo(() => generateListItems(propertiesLlamaCpp, commandLineFlags.LlamaCpp), [propertiesLlamaCpp, searchValue]);
  const flagCTransformersElements = useMemo(
    () => generateListItems(propertiesCTransformers, commandLineFlags.CTransformers),
    [propertiesCTransformers, searchValue],
  );
  const flagAutoGPTQElements = useMemo(() => generateListItems(propertiesAutoGPTQ, commandLineFlags.AutoGPTQ), [propertiesAutoGPTQ, searchValue]);
  const flagExLlamaElements = useMemo(() => generateListItems(propertiesExLlama, commandLineFlags.ExLlama), [propertiesExLlama, searchValue]);
  const flagGPTQForLLaMaElements = useMemo(
    () => generateListItems(propertiesGPTQForLLaMa, commandLineFlags.GPTQForLLaMa),
    [propertiesGPTQForLLaMa, searchValue],
  );
  const flagDeepSpeedElements = useMemo(() => generateListItems(propertiesDeepSpeed, commandLineFlags.DeepSpeed), [propertiesDeepSpeed, searchValue]);
  const flagRWKVElements = useMemo(() => generateListItems(propertiesRWKV, commandLineFlags.RWKV), [propertiesRWKV, searchValue]);
  const flagRoPEElements = useMemo(() => generateListItems(propertiesRoPE, commandLineFlags.RoPE), [propertiesRoPE, searchValue]);
  const flagGradioElements = useMemo(() => generateListItems(propertiesGradio, commandLineFlags.Gradio), [propertiesGradio, searchValue]);
  const flagAPIElements = useMemo(() => generateListItems(propertiesAPI, commandLineFlags.API), [propertiesAPI, searchValue]);
  const flagMultimodalElements = useMemo(
    () => generateListItems(propertiesMultimodal, commandLineFlags.Multimodal),
    [propertiesMultimodal, searchValue],
  );

  // Close self component
  const closeHandle = () => {
    setShowListMenu(false);
    setBlockBackground((prevState) => !prevState);
  };

  const toggleSearch = () => {
    setIsSearching((prevState) => !prevState);
  };

  // Memorizing the result of newData this prevents unnecessary re-renders when the dependencies [clEnabled, searchValue] have not changed
  const newData = useMemo(() => {
    const elements: React.JSX.Element[] = [];

    if (searchValue === '') {
      elements.push(<FullTitleComp key="Command line flags" name="Command line flags" revealAnimation />);
      elements.push(<SubTitleComp key="Basic Settings :" name="Basic Settings :" revealAnimation />);
    }

    flagBasicSettingsElements.forEach((value) => {
      if (value) elements.push(value);
    });

    if (searchValue === '') {
      elements.push(<SubTitleComp key="Model Loader :" name="Model Loader :" revealAnimation />);
    }
    flagModelLoaderElements.forEach((value) => {
      if (value) elements.push(value);
    });
    if (searchValue === '') {
      elements.push(<SubTitleComp key="Accelerate/transformers :" name="Accelerate/transformers :" revealAnimation />);
    }
    flagAccelerateTransformersElements.forEach((value) => {
      if (value) elements.push(value);
    });
    if (searchValue === '') {
      elements.push(<SubTitleComp key="Accelerate 4-bit :" name="Accelerate 4-bit :" revealAnimation />);
    }
    flagAccelerate4bitElements.forEach((value) => {
      if (value) elements.push(value);
    });
    if (searchValue === '') {
      elements.push(<SubTitleComp key="GGUF (for llama.cpp and ctransformers) :" name="GGUF (for llama.cpp and ctransformers) :" revealAnimation />);
    }
    flagGGUFElements.forEach((value) => {
      if (value) elements.push(value);
    });
    if (searchValue === '') {
      elements.push(<SubTitleComp key="llama.cpp :" name="llama.cpp :" revealAnimation />);
    }
    flagLlamaCppElements.forEach((value) => {
      if (value) elements.push(value);
    });
    if (searchValue === '') {
      elements.push(<SubTitleComp key="ctransformers :" name="ctransformers :" revealAnimation />);
    }
    flagCTransformersElements.forEach((value) => {
      if (value) elements.push(value);
    });
    if (searchValue === '') {
      elements.push(<SubTitleComp key="AutoGPTQ :" name="AutoGPTQ :" revealAnimation />);
    }
    flagAutoGPTQElements.forEach((value) => {
      if (value) elements.push(value);
    });
    if (searchValue === '') {
      elements.push(<SubTitleComp key="ExLlama :" name="ExLlama :" revealAnimation />);
    }
    flagExLlamaElements.forEach((value) => {
      if (value) elements.push(value);
    });
    if (searchValue === '') {
      elements.push(<SubTitleComp key="GPTQ-for-LLaMa :" name="GPTQ-for-LLaMa :" revealAnimation />);
    }
    flagGPTQForLLaMaElements.forEach((value) => {
      if (value) elements.push(value);
    });
    if (searchValue === '') {
      elements.push(<SubTitleComp key="DeepSpeed :" name="DeepSpeed :" revealAnimation />);
    }
    flagDeepSpeedElements.forEach((value) => {
      if (value) elements.push(value);
    });
    if (searchValue === '') {
      elements.push(<SubTitleComp key="RWKV :" name="RWKV :" revealAnimation />);
    }
    flagRWKVElements.forEach((value) => {
      if (value) elements.push(value);
    });
    if (searchValue === '') {
      elements.push(
        <SubTitleComp
          key="RoPE (for llama.cpp, ExLlama, ExLlamaV2, and transformers) :"
          name="RoPE (for llama.cpp, ExLlama, ExLlamaV2, and transformers) :"
          revealAnimation
        />,
      );
    }
    flagRoPEElements.forEach((value) => {
      if (value) elements.push(value);
    });
    if (searchValue === '') {
      elements.push(<SubTitleComp key="Gradio :" name="Gradio :" revealAnimation />);
    }
    flagGradioElements.forEach((value) => {
      if (value) elements.push(value);
    });
    if (searchValue === '') {
      elements.push(<SubTitleComp key="API :" name="API :" revealAnimation />);
    }
    flagAPIElements.forEach((value) => {
      if (value) elements.push(value);
    });
    if (searchValue === '') {
      elements.push(<SubTitleComp key="Multimodal :" name="Multimodal :" revealAnimation />);
    }
    flagMultimodalElements.forEach((value) => {
      if (value) elements.push(value);
    });

    return elements;
  }, [searchValue]);

  return (
    <motion.div
      variants={pageVariants}
      initial="comeOut"
      animate="comeIn"
      exit="comeOut"
      className="fixed inset-x-10 bottom-8 top-16 z-40 flex flex-col
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
