import {Outlet} from 'react-router-dom';

import {useCardsState} from '../../Redux/AI/CardsReducer';
import RunningCardView from '../RunningCardView/RunningCardView';

export default function AppPages() {
  const {isRunning} = useCardsState('runningCard');
  return isRunning ? <RunningCardView /> : <Outlet />;
}
