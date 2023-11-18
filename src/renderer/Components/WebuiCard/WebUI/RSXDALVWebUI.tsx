// Import packages
import React from 'react';
// Import components
import CardWebUi from '../Card/CardWebUi';
// Import assets
import rsxdalvImg from '../../../../Assets/AiCard/RepoUser/RSXDALV.jpg';
import cardBackgroundImg from '../../../../Assets/AiCard/BGCardAudioGeneration.jpg';

const userName: string = 'RSXDALV';

export default function RSXDALVWebUI() {
  return (
    <CardWebUi
      webuiData={{
        repoUserName: userName,
        webUiDesc: 'TTS Generation WebUI',
        repoAvatarImg: rsxdalvImg,
        cardBackgroundImg,
        cardBackgroundPosition: 'object-right',
      }}
      haveSettingsMenu={false}
    />
  );
}
