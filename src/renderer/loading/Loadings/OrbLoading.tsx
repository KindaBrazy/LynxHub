import {APP_NAME} from '../../../cross/CrossConstants';
import ShinyText from '../../src/App/Components/Reusable/ShinyText';
import OrbBG from '../Backgrounds/OrbBG';

export default function OrbLoading() {
  return (
    <div className="draggable absolute inset-0 overflow-hidden bg-LynxRaisinBlack scrollbar-hide">
      <OrbBG hue={5} />
      <div className="absolute top-1/2 -translate-y-1/2 w-full text-center py-5">
        <ShinyText speed={2} text={`Powering Up ${APP_NAME}...`} className="text-[1.05rem] font-bold" />
      </div>
    </div>
  );
}
