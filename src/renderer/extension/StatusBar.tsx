import {useAppState} from '../src/App/Redux/App/AppReducer';

function StatusBar() {
  return null;
}

function StatusBarStart() {
  const darkMode = useAppState('darkMode');
  return <span className={`${darkMode ? 'text-success' : 'text-danger'}`}>{'Starting by me'}</span>;
}

function StatusBarCenter() {
  const darkMode = useAppState('darkMode');
  return <span className={`${darkMode ? 'text-success' : 'text-danger'}`}>{'See me in center'}</span>;
}

function StatusBarEnd() {
  const darkMode = useAppState('darkMode');
  return <span className={`${darkMode ? 'text-success' : 'text-danger'}`}>{"I'm at the end."}</span>;
}

StatusBar.Start = StatusBarStart;

StatusBar.Center = StatusBarCenter;

StatusBar.End = StatusBarEnd;

export default StatusBar;
