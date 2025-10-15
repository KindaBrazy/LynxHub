import {AppName} from './AppName';
import Container from './Container';

export default function SimpleLoading() {
  return (
    <Container>
      <AppName className="text-center" textClassName="!text-[3rem]" />
    </Container>
  );
}
