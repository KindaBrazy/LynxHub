// Import packages
import React, {useEffect, useState} from 'react';
import {AnimatePresence} from 'framer-motion';
// Import components
import CardWebUi from '../Card/CardWebUi';
// Import assets
import oobaboogaImg from '../../../../Assets/AiCard/RepoUser/OOBABOOGA.png';
import cardBackgroundImg from '../../../../Assets/AiCard/BGCardTextGeneration.jpg';
import {ipcUserData} from '../../RendererIpcHandler';
import WebUiTGLaunchSettings from '../LaunchSettings/WebUiTGLaunchSettings';

const userName: string = 'OOBABOOGA';

export default function OOBABOOGAWebUI() {
  const [launchSettingsMenu, setLaunchSettingsMenu] = useState(false);

  // Toggle to show launch settings or WebUi card
  const ToggleSettings = () => {
    setLaunchSettingsMenu((prevState) => !prevState);
  };

  useEffect(() => {
    // Initialize webui launch config object in main process on startup
    ipcUserData.readLaunchDataFromFile(userName);
  }, []);

  return (
    <>
      <CardWebUi
        webuiData={{
          repoUserName: userName,
          webUiDesc: 'Text Generation WebUi',
          repoAvatarImg: oobaboogaImg,
          cardBackgroundImg,
          cardBackgroundPosition: 'object-bottom',
        }}
        launchSettingsMenu={launchSettingsMenu}
        toggleSettings={ToggleSettings}
      />
      {/* AnimatePresence for exit animations */}
      <AnimatePresence>{launchSettingsMenu && <WebUiTGLaunchSettings repoUserName={userName} ToggleSettings={ToggleSettings} />}</AnimatePresence>
    </>
  );
}
