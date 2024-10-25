import {ContainerElements, ElementProps, StatusBarComponent} from '../../../cross/ExtensionTypes';
import {useAppState} from '../../src/App/Redux/App/AppReducer';

const StatusBar: StatusBarComponent = {};

function StatusBarContainer(_elements: ContainerElements) {
  return null;
  /*return (
    <div
      className={
        'flex h-7 w-full flex-row justify-between border-t border-foreground/10' +
        ' items-center bg-blue-700 px-3 text-small'
      }>
      <div>
        {elements.start.map((Start, index) => (
          <Start key={index} className="shrink-0" />
        ))}
      </div>
      <div>
        {elements.center.map((Center, index) => (
          <Center key={index} className="shrink-0" />
        ))}
      </div>
      <div>
        {elements.end.map((End, index) => (
          <End key={index} className="shrink-0" />
        ))}
      </div>
    </div>
  );*/
}

function StatusBarStart({className, ...props}: ElementProps) {
  const darkMode = useAppState('darkMode');
  return (
    <span className={`${darkMode ? 'text-success' : 'text-danger'} ${className}`} {...props}>
      {'Starting by me'}
    </span>
  );
}

function StatusBarCenter({className, ...props}: ElementProps) {
  const darkMode = useAppState('darkMode');
  return (
    <span className={`${darkMode ? 'text-success' : 'text-danger'} ${className}`} {...props}>
      {'See me in center'}
    </span>
  );
}

function StatusBarEnd({className, ...props}: ElementProps) {
  const darkMode = useAppState('darkMode');
  return (
    <span className={`${darkMode ? 'text-success' : 'text-danger'} ${className}`} {...props}>
      {"I'm at the end."}
    </span>
  );
}

StatusBar.Container = StatusBarContainer;

StatusBar.Start = StatusBarStart;

StatusBar.Center = StatusBarCenter;

StatusBar.End = StatusBarEnd;

export default StatusBar;
