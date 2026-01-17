import {APP_NAME} from '@lynx_cross/consts';

import ShinyText from '../../main_window/components/ShinyText';

export function AppName({className, textClassName}: {className?: string; textClassName?: string}) {
  return (
    <div className={className || 'absolute bottom-10'}>
      <ShinyText
        speed={2}
        text={APP_NAME}
        darkMode={true}
        className={`text-[2.5rem] font-semibold tracking-tighter ${textClassName}`}
      />
    </div>
  );
}
