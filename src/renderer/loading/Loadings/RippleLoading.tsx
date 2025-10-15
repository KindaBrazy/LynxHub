import {APP_NAME} from '../../../cross/CrossConstants';
import ShinyText from '../../src/App/Components/Reusable/ShinyText';
import {Ripple} from '../Backgrounds/RippleBG';

export default function ThreadsLoading() {
  return (
    <div
      className={
        'dark absolute inset-0 flex flex-col items-center justify-center overflow-hidden draggable bg-LynxRaisinBlack'
      }>
      <Ripple numCircles={6} mainCircleSize={110} mainCircleOpacity={0.4} />
      <div className="w-full text-center">
        <ShinyText speed={2} text={APP_NAME} darkMode={true} className="text-[2.7rem] font-semibold tracking-tighter" />
      </div>
    </div>
  );
}
