import {APP_NAME} from '../../../cross/CrossConstants';
import ShinyText from '../../src/App/Components/Reusable/ShinyText';

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
