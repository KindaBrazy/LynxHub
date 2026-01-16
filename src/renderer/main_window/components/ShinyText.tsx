import {useMemo} from 'react';

type ShinyTextProps = {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  darkMode?: boolean;
};

export default function ShinyText({
  text,
  disabled = false,
  speed = 5,
  className = '',
  darkMode = true,
}: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  const backgroundImage = useMemo(() => {
    const color = darkMode ? '255' : '70';
    const rgb = `${color}, ${color}, ${color}`;

    return `linear-gradient(120deg, rgba(${rgb}, 0) 40%, rgba(${rgb}, 0.8) 50%, rgba(${rgb}, 0) 60%)`;
  }, [darkMode]);

  return (
    <div
      style={{
        backgroundImage,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration: animationDuration,
      }}
      className={`text-[#b5b5b5a4] bg-clip-text inline-block ${disabled ? '' : 'animate-shine'} ${className}`}>
      {text}
    </div>
  );
}
