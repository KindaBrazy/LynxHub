import {APP_NAME} from '../../../cross/CrossConstants';
import ShinyText from '../../src/App/Components/Reusable/ShinyText';
import ThreadsBG from '../Backgrounds/ThreadsBG';

export default function ThreadsLoading() {
  return (
    <div className="draggable absolute inset-0 overflow-hidden bg-LynxRaisinBlack scrollbar-hide">
      <ThreadsBG color={[1, 1, 1]} />
      <div className="absolute bottom-10 w-full text-center py-5">
        <ShinyText speed={2} className="text-xl font-semibold" text={`Powering Up ${APP_NAME}...`} />
      </div>
    </div>
  );
}
