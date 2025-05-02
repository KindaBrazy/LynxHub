import {APP_NAME} from '../../../cross/CrossConstants';
import ShinyText from '../../src/App/Components/Reusable/ShinyText';
import LiquidChromeBG from '../Backgrounds/LiquidChromeBG';

export default function LiquidChromeLoading() {
  return (
    <div className="draggable absolute inset-0 overflow-hidden bg-LynxRaisinBlack scrollbar-hide">
      <LiquidChromeBG speed={0.7} amplitude={0.4} baseColor={[0.1, 0.1, 0.1]} />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-full text-center
      bg-LynxRaisinBlack/70 py-5 shadow-xl backdrop-blur-lg">
        <ShinyText speed={2} className="text-xl font-semibold" text={`Powering Up ${APP_NAME}...`} />
      </div>
    </div>
  );
}
