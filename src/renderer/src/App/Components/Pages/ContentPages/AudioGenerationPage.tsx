import {GetComponentsByPath} from '../../Cards/Cards';
import Page from '../Page';

export const audioGenRoutePath: string = '/audioGenerationPage';
export const audioGenElementId: string = 'audioGenElement';

// Generating audios with AI
export default function AudioGenerationPage() {
  return (
    <Page className="pt-8" id={audioGenElementId}>
      <GetComponentsByPath routePath={audioGenRoutePath} />
    </Page>
  );
}
