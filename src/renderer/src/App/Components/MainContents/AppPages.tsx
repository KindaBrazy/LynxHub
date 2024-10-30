import {Outlet} from 'react-router-dom';

import {useExtensions} from '../../Extensions/ExtensionsContext';
import {useCardsState} from '../../Redux/AI/CardsReducer';
import RunningCardView from '../RunningCardView/RunningCardView';

export default function AppPages() {
  const {isRunning} = useCardsState('runningCard');
  const {runningAI} = useExtensions();

  return isRunning ? runningAI?.Container ? <runningAI.Container /> : <RunningCardView /> : <Outlet />;
}
