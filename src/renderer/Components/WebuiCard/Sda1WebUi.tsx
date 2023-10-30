// Import packages
import React, {useEffect, useState} from 'react';
import {AnimatePresence} from 'framer-motion';
// Import components
import CardWebUi from './Card/CardWebUi';
import WebUiSDLaunchSettings from './WebUiSDLaunchSettings';
// Import assets
import automatic1111Img from '../../../Assets/AiCard/RepoUser/AUTOMATIC1111.png';
import stableDiffusionImg from '../../../Assets/AiCard/BGCardImageGeneration.png';
import {ipcUserData} from '../RendererIpcHandler';

const userName: string = 'AUTOMATIC1111';

export default function Sda1WebUi() {
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
          webUiDesc: 'Stable Diffusion WebUi',
          repoAvatarImg: automatic1111Img,
          cardBackgroundImg: stableDiffusionImg,
          cardBackgroundPosition: 'object-bottom',
        }}
        launchSettingsMenu={launchSettingsMenu}
        toggleSettings={ToggleSettings}
      />
      {/* AnimatePresence for exit animations */}
      <AnimatePresence>{launchSettingsMenu && <WebUiSDLaunchSettings repoUserName={userName} ToggleSettings={ToggleSettings} />}</AnimatePresence>
    </>
  );
}
