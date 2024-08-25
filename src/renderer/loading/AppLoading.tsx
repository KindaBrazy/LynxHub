import {Player} from '@lottiefiles/react-lottie-player';

import {APP_NAME} from '../../cross/CrossConstants';
import loadingAnim from './LoadingLottie.json';

/** https://lottiefiles.com/animations/ripple-loading-animation-FDPWc85Xcn
 *  Lottie loading animation reference
 */

export default function AppLoading() {
  return (
    <div className="draggable absolute inset-0 overflow-hidden bg-LynxRaisinBlack scrollbar-hide">
      <Player
        src={loadingAnim}
        className="absolute left-1/2 top-4 size-64 -translate-x-1/2 rotate-[-140deg] drop-shadow-xl"
        loop
        autoplay
      />
      <span className="absolute inset-x-4 bottom-16 text-center text-white">Powering Up {APP_NAME}...</span>
    </div>
  );
}
