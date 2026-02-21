import {useEffect, useState} from 'react';

import LiquidChrome from '../animations/LiquidChrome';
import {AppName} from '../AppName';
import Container from '../Container';

/**
 * Loading screen component featuring the LiquidChrome animation.
 * It initializes a random amplitude for the animation on mount.
 */
export default function LiquidChromeLoading() {
  const [amplitude, setAmplitude] = useState(0.1);

  useEffect(() => {
    setAmplitude(Math.random() * (0.4 - 0.1) + 0.1);
  }, []);

  return (
    <Container>
      <LiquidChrome speed={0.7} amplitude={amplitude} baseColor={[0.1, 0.1, 0.1]} />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-full text-center
      bg-LynxRaisinBlack/70 py-3 shadow-xl backdrop-blur-md">
        <AppName className="text-center" />
      </div>
    </Container>
  );
}
