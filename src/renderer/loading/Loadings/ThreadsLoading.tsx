import ThreadsBG from '../Backgrounds/ThreadsBG';
import {AppName} from './AppName';
import Container from './Container';

export default function ThreadsLoading() {
  return (
    <Container>
      <ThreadsBG color={[1, 1, 1]} />
      <AppName className="absolute bottom-10" />
    </Container>
  );
}
