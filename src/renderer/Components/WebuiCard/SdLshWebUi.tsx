// Import packages
import React, {useEffect, useState} from 'react';
import {AnimatePresence} from 'framer-motion';
// Import components
import CardWebUi from './Card/CardWebUi';
import WebUiLaunchSettings from './WebUiLaunchSettings';
// Import assets
import lshqqytigerImg from '../../../Assets/AiCard/RepoUser/LSHQQYTIGER.png';
import stableDiffusionImg from '../../../Assets/AiCard/StableDiffusion.png';
import {ipcUserData} from '../RendererIpcHandler';

const userName: string = 'LSHQQYTIGER';

export default function SdLshWebUi() {
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
          webUiDesc: 'Stable Diffusion Directml WebUi',
          repoAvatarImg: lshqqytigerImg,
          cardBackgroundImg: stableDiffusionImg,
          cardBackgroundPosition: 'object-right-top',
        }}
        launchSettingsMenu={launchSettingsMenu}
        toggleSettings={ToggleSettings}
      />
      {/* AnimatePresence for exit animations */}
      <AnimatePresence>{launchSettingsMenu && <WebUiLaunchSettings repoUserName={userName} ToggleSettings={ToggleSettings} />}</AnimatePresence>
    </>
  );
}
