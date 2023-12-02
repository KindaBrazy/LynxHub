// Import components
import CardWebUi from '../Card/CardWebUi';
// Import assets
import comfyImg from '../../../../Assets/AiCard/RepoUser/COMFYANONYMOUS.png';
import cardBackgroundImg from '../../../../Assets/AiCard/BGCardImageGeneration.png';

const userName: string = 'COMFYANONYMOUS';

export default function ComfyWebUI() {
  return (
    <CardWebUi
      webuiData={{
        repoUserName: userName,
        webUiDesc: 'Modular Stable Diffusion (ComfyUI)',
        repoAvatarImg: comfyImg,
        cardBackgroundImg,
        cardBackgroundPosition: 'object-top',
      }}
      haveSettingsMenu={false}
    />
  );
}
