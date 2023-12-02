// Import components
import CardWebUi from '../Card/CardWebUi';
// Import assets
import rsxdalvImg from '../../../../Assets/AiCard/RepoUser/RSXDALV.jpg';
import cardBackgroundImg from '../../../../Assets/AiCard/BGCardAudioGeneration.jpg';

const userName: string = 'RSXDALV';

export default function RsxdalvWebUI() {
  return (
    <CardWebUi
      webuiData={{
        repoUserName: userName,
        webUiDesc: 'TTS Generation',
        repoAvatarImg: rsxdalvImg,
        cardBackgroundImg,
        cardBackgroundPosition: 'object-right',
      }}
      haveSettingsMenu={false}
    />
  );
}
