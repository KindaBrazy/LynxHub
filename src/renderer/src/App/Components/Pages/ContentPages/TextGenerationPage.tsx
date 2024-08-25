import {GetComponentsByPath} from '../../Cards/Cards';
import Page from '../Page';

export const textGenRoutePath: string = '/textGenerationPage';
export const textGenElementId: string = 'textGenElement';

// Chatting with AI
export default function TextGenerationPage() {
  return (
    <Page className="pt-8" id={textGenElementId}>
      <GetComponentsByPath routePath={textGenRoutePath} />
    </Page>
  );
}
