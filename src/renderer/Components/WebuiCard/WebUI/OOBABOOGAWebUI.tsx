// Import packages
import React, {useContext, useEffect, useState} from 'react';
import {AnimatePresence} from 'framer-motion';
// Import components
import CardWebUi from '../Card/CardWebUi';
// Import assets
import oobaboogaImg from '../../../../Assets/AiCard/RepoUser/OOBABOOGA.png';
import cardBackgroundImg from '../../../../Assets/AiCard/BGCardTextGeneration.jpg';
import {ipcUserData} from '../../RendererIpcHandler';
import WebUiTGLaunchSettings from '../LaunchSettings/WebUiTGLaunchSettings';
import StatusContext, {StatusContextType} from '../../GlobalStateContext';

const userName: string = 'OOBABOOGA';

export default function OobaboogaWebUI() {
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
          webUiDesc: 'Text Generation',
          repoAvatarImg: oobaboogaImg,
          cardBackgroundImg,
          cardBackgroundPosition: 'object-bottom',
        }}
        toggleSettings={ToggleSettings}
      />
      {selectedPage === startedWithPage && (
        <>
          {/* AnimatePresence for exit animations */}
          <AnimatePresence>{launchSettingsMenu && <WebUiTGLaunchSettings repoUserName={userName} ToggleSettings={ToggleSettings} />}</AnimatePresence>
        </>
      )}
    </>
  );
}
