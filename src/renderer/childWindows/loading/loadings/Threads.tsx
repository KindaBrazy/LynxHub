import Threads from '../animations/Threads';
import {AppName} from '../AppName';
import Container from '../Container';

/**
 * Loading screen component featuring the Threads animation.
 */
export default function ThreadsLoading() {
  return (
    <Container>
      <Threads />
      <AppName className="absolute bottom-10" />
    </Container>
  );
}
