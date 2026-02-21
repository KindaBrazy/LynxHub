import {AppName} from '../AppName';
import Container from '../Container';

/**
 * A simple loading screen component with just the app name.
 */
export default function SimpleLoading() {
  return (
    <Container>
      <AppName className="text-center" textClassName="!text-[3rem]" />
    </Container>
  );
}
