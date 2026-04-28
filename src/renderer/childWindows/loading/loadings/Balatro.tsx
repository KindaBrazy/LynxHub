import {useEffect, useState} from 'react';

import Balatro from '../animations/Balatro';
import {AppName} from '../AppName';
import Container from '../Container';

/**
 * Loading screen component featuring the Threads animation.
 */
export default function BalartoLoading() {
  const [spinEase, setSpinEase] = useState<number>(1);
  const [spinSpeed, setSpinSpeed] = useState<number>(5);

  useEffect(() => {
    setSpinEase(Math.random() * 3 + 1);
    setSpinSpeed(Math.random() * 25 + 5);
  }, []);

  return (
    <Container className="bg-black">
      <Balatro
        isRotate={false}
        color1="#000000"
        color2="#ffffff"
        color3="#162325"
        spinAmount={0.05}
        pixelFilter={500}
        spinEase={spinEase}
        spinSpeed={spinSpeed}
        mouseInteraction={false}
      />
      <div
        className={
          'absolute top-1/2 -translate-y-1/2 w-full text-center bg-LynxRaisinBlack/60 py-3 shadow-xl backdrop-blur-md'
        }>
        <AppName className="text-center" />
      </div>
    </Container>
  );
}
