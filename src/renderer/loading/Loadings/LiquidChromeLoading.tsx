import {useEffect, useState} from 'react';

import LiquidChromeBG from '../Backgrounds/LiquidChromeBG';
import {AppName} from './AppName';
import Container from './Container';

export default function LiquidChromeLoading() {
  const [amplitude, setAmplitude] = useState(0.1);

  useEffect(() => {
    setAmplitude(Math.random() * (0.4 - 0.1) + 0.1);
  }, []);

  return (
    <Container>
      <LiquidChromeBG speed={0.7} amplitude={amplitude} baseColor={[0.1, 0.1, 0.1]} />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-full text-center
      bg-LynxRaisinBlack/70 py-3 shadow-xl backdrop-blur-md">
        <AppName className="text-center" />
      </div>
    </Container>
  );
}
