import LightPillar from '../animations/LightPillar';
import {AppName} from '../AppName';
import Container from '../Container';

/**
 * Loading screen component featuring the Threads animation.
 */
export default function LightPillarLoading() {
  return (
    <Container>
      <LightPillar
        intensity={1}
        quality="high"
        pillarWidth={6}
        topColor="#ffffff"
        glowAmount={0.002}
        pillarHeight={0.4}
        noiseIntensity={0}
        rotationSpeed={0.3}
        pillarRotation={35}
        interactive={false}
        bottomColor="#020000"
        mixBlendMode="normal"
      />
      <div
        className={
          'absolute top-1/2 -translate-y-1/2 w-full text-center bg-LynxRaisinBlack/70 py-3 shadow-xl backdrop-blur-md'
        }>
        <AppName className="text-center" />
      </div>
    </Container>
  );
}
