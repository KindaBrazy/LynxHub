import ThreadsBG from '../animations/Threads';
import {AppName} from '../AppName';
import Container from '../Container';

export default function ThreadsLoading() {
  return (
    <Container>
      <ThreadsBG />
      <AppName className="absolute bottom-10" />
    </Container>
  );
}
