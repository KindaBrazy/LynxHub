import Galaxy from '../animations/Galaxy';
import {AppName} from '../AppName';
import Container from '../Container';

/**
 * Loading screen component featuring the Threads animation.
 */
export default function GalaxyLoading() {
  return (
    <Container className="bg-black">
      <Galaxy
        speed={1}
        density={1}
        starSpeed={1}
        hueShift={140}
        saturation={0.2}
        glowIntensity={0.3}
        rotationSpeed={0.1}
        repulsionStrength={2}
        mouseRepulsion={false}
        twinkleIntensity={0.3}
        mouseInteraction={false}
        autoCenterRepulsion={0.7}
      />
      <div className="absolute top-1/2 -translate-y-1/2 w-full text-center">
        <AppName className="text-center" />
      </div>
    </Container>
  );
}
