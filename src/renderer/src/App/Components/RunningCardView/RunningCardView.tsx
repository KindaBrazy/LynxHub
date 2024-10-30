import {useExtensions} from '../../Extensions/ExtensionsContext';
import Browser from './Browser';
import LynxTerminal from './LynxTerminal';

export default function RunningCardView() {
  const {runningAI} = useExtensions();

  return (
    <>
      {runningAI?.Terminal ? <runningAI.Terminal /> : <LynxTerminal />}
      {runningAI?.Browser ? <runningAI.Browser /> : <Browser />}
    </>
  );
}
