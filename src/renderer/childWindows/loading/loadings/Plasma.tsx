import Plasma from '../animations/Plasma';
import {AppName} from '../AppName';
import Container from '../Container';

/**
 * Loading screen component featuring the Threads animation.
 */
export default function PlasmaLoading() {
  return (
    <Container>
      <Plasma speed={1} scale={0.5} opacity={0.8} color="#ffffff" direction="forward" mouseInteractive={false} />
      <div
        className={'absolute top-1/2 -translate-y-1/2 w-full text-center bg-LynxRaisinBlack/60 py-3 backdrop-blur-sm'}>
        <AppName className="text-center" />
      </div>
    </Container>
  );
}
