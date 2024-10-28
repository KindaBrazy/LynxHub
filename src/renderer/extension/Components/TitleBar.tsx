import {ElementProps, TitleBarComponent} from '../../../cross/ExtensionTypes';
import {useAppState} from '../../src/App/Redux/App/AppReducer';

const TitleBar: TitleBarComponent = {};

// @ts-ignore
function AddStart({className, ...props}: ElementProps) {
  return null;
}

// @ts-ignore
function ReplaceCenter({className, ...props}: ElementProps) {
  return null;
}

function AddCenter({className, ...props}: ElementProps) {
  const darkMode = useAppState('darkMode');
  return (
    <span className={`${darkMode ? 'text-success' : 'text-danger'} ${className}`} {...props}>
      Center
    </span>
  );
}

// @ts-ignore
function ReplaceEnd({className, ...props}: ElementProps) {
  return null;
}

// @ts-ignore
function AddEnd({className, ...props}: ElementProps) {
  return null;
}

TitleBar.AddStart = AddStart;

TitleBar.AddCenter = AddCenter;
TitleBar.ReplaceCenter = ReplaceCenter;

TitleBar.ReplaceEnd = ReplaceEnd;
TitleBar.AddEnd = AddEnd;

export default TitleBar;
