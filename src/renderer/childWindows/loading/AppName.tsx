import ShinyText from '@lynx/components/ShinyText';
import {APP_NAME} from '@lynx_common/consts';
import {cn} from '@heroui/react';

interface AppNameProps {
  /** Optional className for the container div. Defaults to 'absolute bottom-10'. */
  className?: string;
  /** Optional className for the ShinyText component. */
  textClassName?: string;
}

/**
 * AppName component displays the application name with a shiny text effect.
 */
export function AppName({className, textClassName}: AppNameProps) {
  return (
    <div className={className || 'absolute bottom-10'}>
      <ShinyText
        speed={2}
        text={APP_NAME}
        darkMode={true}
        className={cn('text-[2.5rem] font-semibold tracking-tighter', textClassName)}
      />
    </div>
  );
}
