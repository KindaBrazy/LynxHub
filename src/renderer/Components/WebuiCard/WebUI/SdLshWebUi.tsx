// Import packages
import React, {useContext, useEffect, useState} from 'react';
import {AnimatePresence} from 'framer-motion';
// Import components
import CardWebUi from '../Card/CardWebUi';
import WebUiSDLaunchSettings from '../LaunchSettings/WebUiSDLaunchSettings';
// Import assets
import lshqqytigerImg from '../../../../Assets/AiCard/RepoUser/LSHQQYTIGER.png';
import stableDiffusionImg from '../../../../Assets/AiCard/BGCardImageGeneration.png';
import {ipcUserData} from '../../RendererIpcHandler';
import StatusContext, {StatusContextType} from '../../GlobalStateContext';

const userName: string = 'LSHQQYTIGER';

export default function SdLshWebUI() {
  const {selectedPage} = useContext(StatusContext) as StatusContextType;
  const [launchSettingsMenu, setLaunchSettingsMenu] = useState(false);
  const [startedWithPage] = useState<number>(selectedPage);

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
          webUiDesc: 'Stable Diffusion DirectML',
          repoAvatarImg: lshqqytigerImg,
          cardBackgroundImg: stableDiffusionImg,
          cardBackgroundPosition: 'object-right-bottom',
        }}
        toggleSettings={ToggleSettings}
      />
      {selectedPage === startedWithPage && (
        <>
          {/* AnimatePresence for exit animations */}
          <AnimatePresence>{launchSettingsMenu && <WebUiSDLaunchSettings repoUserName={userName} ToggleSettings={ToggleSettings} />}</AnimatePresence>
        </>
      )}
    </>
  );
}
