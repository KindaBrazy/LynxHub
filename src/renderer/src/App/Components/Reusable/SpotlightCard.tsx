import {MouseEventHandler, ReactNode, useRef, useState} from 'react';

interface Position {
  x: number;
  y: number;
}

type Props = {
  children?: ReactNode;
  className?: string;
  spotlightColor?: string;
};

export default function SpotlightCard({children, className = '', spotlightColor = 'rgba(255, 255, 255, 0.25)'}: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({x: 0, y: 0});
  const [opacity, setOpacity] = useState<number>(0);

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = e => {
    if (!divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({x: e.clientX - rect.left, y: e.clientY - rect.top});
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(0.6);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onBlur={handleBlur}
      onFocus={handleFocus}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <div
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
      />
      {children}
    </div>
  );
}
