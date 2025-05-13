import {APP_NAME} from '../../../cross/CrossConstants';
import ShinyText from '../../src/App/Components/Reusable/ShinyText';

export default function SimpleLoading() {
  return (
    <div className="draggable absolute inset-0 overflow-hidden bg-LynxRaisinBlack scrollbar-hide">
      <div className="absolute top-1/2 -translate-y-1/2 w-full text-center py-5">
        <ShinyText speed={2} className="text-xl font-semibold" text={`Powering Up ${APP_NAME}...`} />
      </div>
    </div>
  );
}
