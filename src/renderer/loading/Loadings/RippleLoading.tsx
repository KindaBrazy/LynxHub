import {Ripple} from '../Backgrounds/RippleBG';
import {AppName} from './AppName';
import Container from './Container';

export default function ThreadsLoading() {
  return (
    <Container>
      <Ripple numCircles={6} mainCircleSize={110} mainCircleOpacity={0.4} />
      <AppName className="text-center" />
    </Container>
  );
}
