import {GetComponentsByPath} from '../../Cards/Cards';
import Page from '../Page';

export const imageGenRoutePath: string = '/imageGenerationPage';
export const imageGenElementId: string = 'imageGenElement';

// Generating images with AI
export default function ImageGenerationPage() {
  return (
    <Page className="pt-8" id={imageGenElementId}>
      <GetComponentsByPath routePath={imageGenRoutePath} />
    </Page>
  );
}
