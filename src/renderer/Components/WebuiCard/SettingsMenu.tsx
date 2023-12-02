import {motion} from 'framer-motion';
import React, {useContext, useEffect, useState} from 'react';
import SimpleCloseButton from '../Customizable/SimpleCloseButton';
import StatusContext, {StatusContextType} from '../GlobalStateContext';
import DropDownMenu from '../Customizable/DropDownMenu';
import LCheckBox from '../Customizable/LCheckBox';
import {ipcWindowManager} from '../RendererIpcHandler';
import {DiscordRP} from '../../../AppState/InterfaceAndTypes';
import {RendererLogError} from '../../../AppState/AppConstants';
import LScrollBar from '../Customizable/LScrollBar';

const themeValues: {
  id: string;
  text: string;
}[] = [
  {id: 'dark', text: 'Dark'},
  {id: 'light', text: 'Light'},
  {id: 'system', text: 'System'},
];
const taskbarValues: {
  id: string;
  text: string;
}[] = [
  {id: 'taskbarAndTray', text: 'Both: Taskbar & Tray'},
  {id: 'justTaskbar', text: 'Just in taskbar'},
  {id: 'justTray', text: 'Just in tray'},
  {id: 'trayWhenMinimized', text: 'Move to tray when minimized'},
];
const windowSizeValues: {
  id: string;
  text: string;
}[] = [
  {id: 'lastSize', text: 'Last used size'},
  {id: 'default', text: 'Default'},
];
const startPage: {
  id: string;
  text: string;
}[] = [
  {id: 'last', text: 'Last opened page'},
  {id: 'image', text: 'Image generation'},
  {id: 'text', text: 'Text generation'},
  {id: 'audio', text: 'Audio generation'},
];

const categoryElement = (text: string) => {
  return (
    <>
      <div className="mb-4 mt-10 h-[1px] w-[95%] bg-black/20 dark:bg-white/20" />
      <span className="mb-4 ml-6 self-start font-bold">{text}</span>
    </>
  );
};

export default function SettingsMenu() {
  const {setSelectedPage, lastSelectedPage, setIsDarkMode} = useContext(StatusContext) as StatusContextType;

  const [currentTheme, setCurrentTheme] = useState<string>();
  const [currentTaskbar, setCurrentTaskbar] = useState<string>();
  const [currentWindowSize, setCurrentWindowSize] = useState<string>();
  const [currentStartPage, setCurrentStartPage] = useState<string>();

  const [discordRP, setDiscordRP] = useState<DiscordRP>({
    AIOneLynx: {Enabled: true, TimeElapsed: true},
    RunningWebUI: {Enabled: true, TimeElapsed: true, WebUIName: true},
  });

  const [currentOpenDrop, setCurrentOpenDrop] = useState('');

  useEffect(() => {
    // initialize isDarkMode state
    async function initDropDowns() {
      const themeValue = await ipcWindowManager.getThemeSource();
      if (themeValue !== undefined) setCurrentTheme(themeValue);

      const taskbarValue = await ipcWindowManager.getTaskbarMode();
      if (taskbarValue !== undefined) setCurrentTaskbar(taskbarValue);

      const windowSizeValue = await ipcWindowManager.getWindowSize();
      if (windowSizeValue !== undefined) setCurrentWindowSize(windowSizeValue);

      const startPageValue = await ipcWindowManager.getStartPage();
      if (startPageValue !== undefined) setCurrentStartPage(startPageValue);

      const discordRpValue = await ipcWindowManager.getDiscordRp();
      if (discordRpValue !== undefined) setDiscordRP(discordRpValue);
    }

    initDropDowns();
  }, []);

  const onThemeChange = (id: string) => {
    // @ts-ignore
    ipcWindowManager.changeDarkMode(id);

    // initialize isDarkMode state
    async function initDarkMode() {
      const value: boolean = await ipcWindowManager.getIsDarkMode();
      setIsDarkMode(value);
    }

    initDarkMode();
  };

  const onTaskbarChange = (id: string) => {
    // @ts-ignore
    ipcWindowManager.appTaskbarStatus(id);
  };

  const onWindowSizeChange = (id: string) => {
    // @ts-ignore
    ipcWindowManager.setWindowSize(id);
  };

  const onStartPageChange = (id: string) => {
    // @ts-ignore
    ipcWindowManager.setStartPage(id);
  };

  const saveDiscordRPToConfig = (data: DiscordRP) => {
    console.log(RendererLogError(`********* Called Here : SettingsMenu.ts`));
    ipcWindowManager.setDiscordRp(data);
  };

  const closeSettings = () => {
    setSelectedPage(lastSelectedPage);
  };

  return (
    <motion.div
      initial={{translateY: '-500px', opacity: 0, scale: 0.5}}
      animate={{translateY: '0px', opacity: 1, scale: 1, transition: {duration: 0.3, ease: 'backOut'}}}
      exit={{translateY: '-500px', opacity: 0, scale: 0.5, transition: {duration: 0.2, ease: 'backIn'}}}
      className="fixed inset-5 top-14 flex flex-col items-center overflow-hidden
         rounded-2xl bg-white/60 shadow-SideBar backdrop-blur-3xl dark:bg-LynxRaisinBlack/80">
      {/* Close button */}
      <SimpleCloseButton onClick={closeSettings} />

      {/* Title */}
      <span className="mt-4 h-[70px] w-full text-center text-3xl font-semibold">Settings</span>

      <LScrollBar extraClassName="pb-4 pt-2">
        <div className="flex w-full flex-col items-center">
          <span className="mb-2 ml-6 self-start font-bold">App</span>
          <DropDownMenu
            categoryText="Theme :"
            id="ThemeSettings"
            items={themeValues}
            currentOpenDrop={currentOpenDrop}
            setCurrentOpenDrop={setCurrentOpenDrop}
            defaultSelectedItem={currentTheme}
            onItemClick={onThemeChange}
          />
          <DropDownMenu
            categoryText="Taskbar :"
            id="TaskbarSettings"
            items={taskbarValues}
            currentOpenDrop={currentOpenDrop}
            setCurrentOpenDrop={setCurrentOpenDrop}
            defaultSelectedItem={currentTaskbar}
            onItemClick={onTaskbarChange}
          />

          {categoryElement('Startup')}
          <DropDownMenu
            categoryText="Window Size :"
            id="WindowSizeSettings"
            items={windowSizeValues}
            currentOpenDrop={currentOpenDrop}
            setCurrentOpenDrop={setCurrentOpenDrop}
            defaultSelectedItem={currentWindowSize}
            onItemClick={onWindowSizeChange}
          />
          <DropDownMenu
            categoryText="Page :"
            id="StartUpPage"
            items={startPage}
            currentOpenDrop={currentOpenDrop}
            setCurrentOpenDrop={setCurrentOpenDrop}
            defaultSelectedItem={currentStartPage}
            onItemClick={onStartPageChange}
          />

          {categoryElement('Discord Activity Status')}
          <div className="flex w-[95%] text-start">
            <LCheckBox
              name="AIOne Lynx"
              highlightEnabled={false}
              defaultEnabled={discordRP.AIOneLynx.Enabled}
              onClick={(_name, enabled) => {
                setDiscordRP((prevState) => {
                  const newState = {...prevState, AIOneLynx: {...prevState.AIOneLynx, Enabled: enabled}};
                  saveDiscordRPToConfig(newState);
                  return newState;
                });
              }}
            />
            {discordRP.AIOneLynx.Enabled && (
              <LCheckBox
                name="Time Elapsed"
                defaultEnabled={discordRP.AIOneLynx.TimeElapsed}
                highlightEnabled={false}
                onClick={(_name, enabled) => {
                  setDiscordRP((prevState) => {
                    const newState = {...prevState, AIOneLynx: {...prevState.AIOneLynx, TimeElapsed: enabled}};
                    saveDiscordRPToConfig(newState);
                    return newState;
                  });
                }}
              />
            )}
          </div>
          <div className="flex w-[95%] flex-wrap text-start">
            <LCheckBox
              name="Running WebUI"
              highlightEnabled={false}
              defaultEnabled={discordRP.RunningWebUI.Enabled}
              onClick={(_name, enabled) => {
                setDiscordRP((prevState) => {
                  const newState = {...prevState, RunningWebUI: {...prevState.RunningWebUI, Enabled: enabled}};
                  saveDiscordRPToConfig(newState);
                  return newState;
                });
              }}
            />
            {discordRP.RunningWebUI.Enabled && (
              <LCheckBox
                name="Time Elapsed"
                defaultEnabled={discordRP.RunningWebUI.TimeElapsed}
                highlightEnabled={false}
                onClick={(_name, enabled) => {
                  setDiscordRP((prevState) => {
                    const newState = {...prevState, RunningWebUI: {...prevState.RunningWebUI, TimeElapsed: enabled}};
                    saveDiscordRPToConfig(newState);
                    return newState;
                  });
                }}
              />
            )}
            {discordRP.RunningWebUI.Enabled && (
              <LCheckBox
                name="WebUI Name"
                defaultEnabled={discordRP.RunningWebUI.WebUIName}
                highlightEnabled={false}
                onClick={(_name, enabled) => {
                  setDiscordRP((prevState) => {
                    const newState = {...prevState, RunningWebUI: {...prevState.RunningWebUI, WebUIName: enabled}};
                    saveDiscordRPToConfig(newState);
                    return newState;
                  });
                }}
              />
            )}
          </div>
        </div>
      </LScrollBar>
    </motion.div>
  );
}
