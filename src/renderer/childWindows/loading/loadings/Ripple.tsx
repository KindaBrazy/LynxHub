import {Ripple} from '../animations/Ripple';
import {AppName} from '../AppName';
import Container from '../Container';

/**
 * Loading screen component featuring the Ripple animation.
 */
export default function RippleLoading() {
  return (
    <Container>
      <Ripple numCircles={6} mainCircleSize={110} mainCircleOpacity={0.4} />
      <AppName className="text-center" />
    </Container>
  );
}
